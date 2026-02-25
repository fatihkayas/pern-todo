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

describe("GET /api/v1/watches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all watches with status 200", async () => {
    const mockWatches = [
      { watch_id: 1, watch_name: "Seiko 5 Sports", price: "340.00", brand: "Seiko" },
      { watch_id: 2, watch_name: "Seiko Presage", price: "599.99", brand: "Seiko" },
    ];
    mockQuery.mockResolvedValueOnce({ rows: mockWatches });

    const res = await request(app).get("/api/v1/watches");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ watch_name: "Seiko 5 Sports" });
  });

  it("returns empty array when no watches in DB", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/v1/watches");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(app).get("/api/v1/watches");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Database error");
  });
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
