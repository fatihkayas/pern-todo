jest.mock("../db", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

jest.mock("stripe", () => {
  const mockStripeInstance = {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        client_secret: "pi_test_secret_123",
        id: "pi_test_123",
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: "pi_test_123",
        status: "succeeded",
      }),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  const MockStripeConstructor = jest.fn().mockImplementation(() => mockStripeInstance);
  return { __esModule: true, default: MockStripeConstructor };
});

import request from "supertest";
import Stripe from "stripe";
import app from "../app";
import pool from "../db";

const mockQuery = pool.query as jest.Mock;
const MockStripe = Stripe as jest.MockedClass<typeof Stripe>;

// Grab the shared mock instance
const stripeInstance = new MockStripe("") as unknown as {
  paymentIntents: { create: jest.Mock; retrieve: jest.Mock };
  webhooks: { constructEvent: jest.Mock };
};

describe("POST /api/stripe/create-payment-intent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a payment intent and returns clientSecret", async () => {
    stripeInstance.paymentIntents.create.mockResolvedValueOnce({
      client_secret: "pi_test_secret_abc",
      id: "pi_test_abc",
    });

    const res = await request(app)
      .post("/api/stripe/create-payment-intent")
      .send({ amount: 299.99, order_id: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("clientSecret");
  });

  it("returns 400 for missing amount (Zod validation)", async () => {
    const res = await request(app).post("/api/stripe/create-payment-intent").send({ order_id: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("returns 400 for missing order_id (Zod validation)", async () => {
    const res = await request(app).post("/api/stripe/create-payment-intent").send({ amount: 100 });

    expect(res.status).toBe(400);
  });

  it("returns 400 for negative amount", async () => {
    const res = await request(app)
      .post("/api/stripe/create-payment-intent")
      .send({ amount: -10, order_id: 1 });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => jest.clearAllMocks());

  it("processes payment_intent.succeeded and updates order status", async () => {
    stripeInstance.webhooks.constructEvent.mockReturnValueOnce({
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test_order_update",
          metadata: { order_id: "42" },
        },
      },
    });
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "valid_sig")
      .send(Buffer.from(JSON.stringify({})));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("UPDATE orders"), [
      "processing",
      "pi_test_order_update",
      "42",
    ]);
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("content-type", "application/json")
      .send(Buffer.from("{}"));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid webhook signature", async () => {
    stripeInstance.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error("No signatures found matching");
    });

    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "bad_sig")
      .send(Buffer.from("{}"));

    expect(res.status).toBe(400);
  });

  it("ignores non-payment_intent.succeeded events", async () => {
    stripeInstance.webhooks.constructEvent.mockReturnValueOnce({
      type: "customer.created",
      data: { object: {} },
    });

    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "valid_sig")
      .send(Buffer.from("{}"));

    expect(res.status).toBe(200);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("POST /api/stripe/confirm-order", () => {
  beforeEach(() => jest.clearAllMocks());

  it("confirms an order after successful payment", async () => {
    stripeInstance.paymentIntents.retrieve.mockResolvedValueOnce({
      id: "pi_test_123",
      status: "succeeded",
    });
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/stripe/confirm-order").send({
      payment_intent_id: "pi_test_123",
      order_id: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: "processing" });
  });

  it("returns 400 when payment is not succeeded", async () => {
    stripeInstance.paymentIntents.retrieve.mockResolvedValueOnce({
      id: "pi_test_123",
      status: "requires_payment_method",
    });

    const res = await request(app).post("/api/stripe/confirm-order").send({
      payment_intent_id: "pi_test_123",
      order_id: 1,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Payment not completed");
  });

  it("returns 400 for missing payment_intent_id", async () => {
    const res = await request(app).post("/api/stripe/confirm-order").send({ order_id: 1 });

    expect(res.status).toBe(400);
  });
});
