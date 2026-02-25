jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../db";

const mockConnect = pool.connect as jest.Mock;
const JWT_SECRET = "seiko_secret_key_change_in_prod";

const makeAuthToken = (customer_id = 1) =>
  jwt.sign({ customer_id, email: "test@test.com" }, JWT_SECRET, { expiresIn: "1h" });

const makeMockClient = (overrides?: Partial<Record<string, jest.Mock>>) => {
  const client = {
    query: jest.fn(),
    release: jest.fn(),
    ...overrides,
  };
  mockConnect.mockResolvedValue(client);
  return client;
};

describe("POST /api/orders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an order for authenticated user (status 201)", async () => {
    const client = makeMockClient();
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ order_id: 42 }] }) // INSERT orders
      .mockResolvedValueOnce(undefined) // INSERT order_items
      .mockResolvedValueOnce(undefined) // UPDATE watches stock
      .mockResolvedValueOnce(undefined); // COMMIT

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${makeAuthToken()}`)
      .send({
        items: [{ watch_id: 1, quantity: 2, unit_price: 299.99 }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ order_id: 42, status: "pending" });
    expect(res.body).toHaveProperty("total_amount");
  });

  it("creates an order for anonymous user (no auth header)", async () => {
    const client = makeMockClient();
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ order_id: 99 }] }) // INSERT orders
      .mockResolvedValueOnce(undefined) // INSERT order_items
      .mockResolvedValueOnce(undefined) // UPDATE watches stock
      .mockResolvedValueOnce(undefined); // COMMIT

    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ watch_id: 2, quantity: 1, unit_price: 599.99 }] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("order_id", 99);
  });

  it("returns 400 for empty items array (Zod validation)", async () => {
    const res = await request(app).post("/api/orders").send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 400 for missing items field", async () => {
    const res = await request(app).post("/api/orders").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 400 for non-numeric watch_id that cannot be coerced", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ watch_id: "abc", quantity: 1, unit_price: 299.99 }],
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 for zero quantity", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ watch_id: 1, quantity: 0, unit_price: 299.99 }],
      });

    expect(res.status).toBe(400);
  });

  it("accepts string prices from DB (coerce.number)", async () => {
    const client = makeMockClient();
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ order_id: 7 }] })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined); // COMMIT

    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ watch_id: "3", quantity: "1", unit_price: "340.00" }],
      });

    expect(res.status).toBe(201);
  });
});
