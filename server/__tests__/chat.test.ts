jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

jest.mock("@trigger.dev/sdk/v3", () => ({
  tasks: {
    trigger: jest.fn(),
  },
  runs: {
    retrieve: jest.fn(),
  },
}));

import request from "supertest";
import app from "../app";
import { tasks, runs } from "@trigger.dev/sdk/v3";

const mockTrigger = tasks.trigger as jest.Mock;
const mockRetrieve = runs.retrieve as jest.Mock;

describe("POST /api/v1/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when messages are missing", async () => {
    const res = await request(app).post("/api/v1/chat").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Messages array is required" });
  });

  it("returns 400 when messages are empty", async () => {
    const res = await request(app).post("/api/v1/chat").send({ messages: [] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Messages array is required" });
  });

  it("triggers async chat job and returns runId", async () => {
    mockTrigger.mockResolvedValueOnce({ id: "run_123" });

    const res = await request(app)
      .post("/api/v1/chat")
      .send({ messages: [{ role: "user", content: "hello" }] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ runId: "run_123" });
    expect(mockTrigger).toHaveBeenCalledWith("chat-async", {
      messages: [{ role: "user", content: "hello" }],
    });
  });

  it("returns 500 when Trigger.dev call fails", async () => {
    mockTrigger.mockRejectedValueOnce(new Error("upstream failure"));

    const res = await request(app)
      .post("/api/v1/chat")
      .send({ messages: [{ role: "user", content: "hello" }] });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Chat failed. Please try again." });
  });
});

describe("GET /api/v1/chat/:runId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns completed status with response text", async () => {
    mockRetrieve.mockResolvedValueOnce({
      status: "COMPLETED",
      output: { text: "done" },
    });

    const res = await request(app).get("/api/v1/chat/run_123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "COMPLETED", text: "done" });
  });

  it("returns failed response for failed runs", async () => {
    mockRetrieve.mockResolvedValueOnce({ status: "FAILED" });

    const res = await request(app).get("/api/v1/chat/run_123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "FAILED",
      text: "Sorry, something went wrong. Please try again.",
    });
  });

  it("returns current status for in-progress runs", async () => {
    mockRetrieve.mockResolvedValueOnce({ status: "RUNNING" });

    const res = await request(app).get("/api/v1/chat/run_123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "RUNNING" });
  });

  it("returns 500 when run retrieval fails", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("retrieve failed"));

    const res = await request(app).get("/api/v1/chat/run_123");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "retrieve failed" });
  });
});