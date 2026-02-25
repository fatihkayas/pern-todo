jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../db";

const mockQuery = pool.query as jest.Mock;
const JWT_SECRET = "seiko_secret_key_change_in_prod";

const makeAdminToken = () =>
  jwt.sign({ customer_id: 1, email: "admin@test.com" }, JWT_SECRET, { expiresIn: "1h" });

// ─── Admin Auth Middleware ─────────────────────────────────────────────────────

describe("Admin auth middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 with no Authorization header", async () => {
    const res = await request(app).get("/api/admin/orders");
    expect(res.status).toBe(401);
  });

  it("returns 401 for a tampered/invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin user", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ is_admin: false }] });

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(403);
  });

  it("returns 403 when customer row is missing", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // no customer found

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(403);
  });
});

// ─── GET /api/admin/orders ─────────────────────────────────────────────────────

describe("GET /api/admin/orders", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all orders for an admin user", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] }) // adminAuth check
      .mockResolvedValueOnce({
        rows: [{ order_id: 1, status: "pending", full_name: "Alice" }],
      }); // orders query

    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("order_id", 1);
  });
});

// ─── PUT /api/admin/orders/:id/status ─────────────────────────────────────────

describe("PUT /api/admin/orders/:id/status", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates order status to processing", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
      .mockResolvedValueOnce({ rows: [{ order_id: 1, status: "processing" }] });

    const res = await request(app)
      .put("/api/admin/orders/1/status")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ status: "processing" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "processing");
  });

  it("returns 404 when order does not exist", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
      .mockResolvedValueOnce({ rows: [] }); // no rows updated

    const res = await request(app)
      .put("/api/admin/orders/999/status")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ status: "shipped" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid status value", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ is_admin: true }] });

    const res = await request(app)
      .put("/api/admin/orders/1/status")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ status: "invalid_status" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("accepts all valid status values", async () => {
    for (const status of ["pending", "shipped", "delivered", "cancelled"]) {
      jest.clearAllMocks();
      mockQuery
        .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
        .mockResolvedValueOnce({ rows: [{ order_id: 1, status }] });

      const res = await request(app)
        .put("/api/admin/orders/1/status")
        .set("Authorization", `Bearer ${makeAdminToken()}`)
        .send({ status });

      expect(res.status).toBe(200);
    }
  });
});

// ─── GET /api/admin/watches ────────────────────────────────────────────────────

describe("GET /api/admin/watches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all watches for an admin user", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ is_admin: true }] }).mockResolvedValueOnce({
      rows: [
        { watch_id: 1, watch_name: "Seiko 5 Sports", stock_quantity: 10 },
        { watch_id: 2, watch_name: "Seiko Presage", stock_quantity: 5 },
      ],
    });

    const res = await request(app)
      .get("/api/admin/watches")
      .set("Authorization", `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// ─── PUT /api/admin/watches/:id/stock ─────────────────────────────────────────

describe("PUT /api/admin/watches/:id/stock", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates watch stock quantity", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
      .mockResolvedValueOnce({ rows: [{ watch_id: 1, stock_quantity: 20 }] });

    const res = await request(app)
      .put("/api/admin/watches/1/stock")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ stock_quantity: 20 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("stock_quantity", 20);
  });

  it("accepts zero (out of stock)", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
      .mockResolvedValueOnce({ rows: [{ watch_id: 1, stock_quantity: 0 }] });

    const res = await request(app)
      .put("/api/admin/watches/1/stock")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ stock_quantity: 0 });

    expect(res.status).toBe(200);
  });

  it("returns 400 for negative stock quantity", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ is_admin: true }] });

    const res = await request(app)
      .put("/api/admin/watches/1/stock")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ stock_quantity: -5 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 404 when watch does not exist", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put("/api/admin/watches/999/stock")
      .set("Authorization", `Bearer ${makeAdminToken()}`)
      .send({ stock_quantity: 5 });

    expect(res.status).toBe(404);
  });
});

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────

describe("GET /api/admin/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns dashboard statistics", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_admin: true }] }) // adminAuth
      .mockResolvedValueOnce({ rows: [{ total: "10", pending: "3" }] }) // orders
      .mockResolvedValueOnce({ rows: [{ total: "50" }] }) // customers
      .mockResolvedValueOnce({ rows: [{ total: "5000.00" }] }) // revenue
      .mockResolvedValueOnce({ rows: [{ total: "28", low_stock: "2" }] }); // watches

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${makeAdminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("orders");
    expect(res.body).toHaveProperty("customers");
    expect(res.body).toHaveProperty("revenue");
    expect(res.body).toHaveProperty("watches");
  });
});
