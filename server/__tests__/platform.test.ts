jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import request from "supertest";
import app from "../app";
import pool from "../db";

const mockQuery = pool.query as jest.Mock;

describe("GET /ready", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ready when database is reachable", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ready" });
  });

  it("returns unavailable when database is unreachable", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection failed"));

    const res = await request(app).get("/ready");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      status: "unavailable",
      reason: "database unreachable",
    });
  });
});

describe("GET /metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Prometheus metrics payload", async () => {
    mockQuery.mockResolvedValue({ rows: [{ count: "0" }] });

    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toContain("watches_low_stock_total");
  });
});