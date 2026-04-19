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
const originalFetch = global.fetch;

describe("PayPal routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PAYPAL_CLIENT_ID = "test-client-id";
    process.env.PAYPAL_CLIENT_SECRET = "test-client-secret";
    process.env.PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 503 when PayPal credentials are missing", async () => {
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;

    const res = await request(app).post("/api/v1/paypal/create-order").send({
      amount: 299.99,
      order_id: 1,
    });

    expect(res.status).toBe(503);
  });

  it("creates a PayPal order", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "paypal-access-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "PAYPAL-ORDER-123" }),
      }) as typeof fetch;

    const res = await request(app).post("/api/v1/paypal/create-order").send({
      amount: 299.99,
      order_id: 1,
      currency: "usd",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ orderId: "PAYPAL-ORDER-123" });
  });

  it("captures a PayPal order and updates the order status", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "paypal-access-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "PAYPAL-ORDER-123", status: "COMPLETED" }),
      }) as typeof fetch;
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/v1/paypal/capture-order").send({
      paypal_order_id: "PAYPAL-ORDER-123",
      order_id: 42,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: "processing" });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("UPDATE orders"), [
      "processing",
      "PAYPAL-ORDER-123",
      42,
    ]);
  });
});
