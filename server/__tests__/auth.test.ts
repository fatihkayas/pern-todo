jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$mocked_hash"),
  compare: jest.fn().mockResolvedValue(true),
}));

import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../app";
import pool from "../db";

const mockQuery = pool.query as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

const JWT_SECRET = "seiko_secret_key_change_in_prod";

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registers a new user and returns token", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // no existing user
      .mockResolvedValueOnce({
        rows: [{ customer_id: 1, email: "test@test.com", full_name: "Test User" }],
      }); // inserted user

    const res = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      full_name: "Test User",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.customer).toMatchObject({
      email: "test@test.com",
      full_name: "Test User",
    });
  });

  it("returns 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-valid",
      full_name: "Test User",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 400 for short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@test.com",
      full_name: "Test User",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 409 for duplicate email", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ customer_id: 99 }] }); // email exists

    const res = await request(app).post("/api/auth/register").send({
      email: "existing@test.com",
      full_name: "Existing User",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("logs in with valid credentials and returns token", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          customer_id: 1,
          email: "test@test.com",
          full_name: "Test User",
          password_hash: "$2a$10$mocked_hash",
        },
      ],
    });
    mockCompare.mockResolvedValueOnce(true);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.customer).toMatchObject({ email: "test@test.com" });
  });

  it("returns 401 for wrong password", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          customer_id: 1,
          email: "test@test.com",
          password_hash: "$2a$10$some_hash",
        },
      ],
    });
    mockCompare.mockResolvedValueOnce(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent user", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });

  it("returns 400 for missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "test@test.com" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "bad-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns decoded user for a valid JWT", async () => {
    const token = jwt.sign({ customer_id: 1, email: "test@test.com" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ customer_id: 1, email: "test@test.com" });
  });

  it("returns 401 when no Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for tampered token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer this.is.invalid");

    expect(res.status).toBe(401);
  });

  it("returns 401 for expired token", async () => {
    const token = jwt.sign(
      { customer_id: 1, email: "test@test.com" },
      JWT_SECRET,
      { expiresIn: "-1s" } // already expired
    );

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
