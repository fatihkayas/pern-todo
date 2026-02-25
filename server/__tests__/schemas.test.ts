import {
  registerSchema,
  loginSchema,
  createOrderSchema,
  createPaymentIntentSchema,
  confirmOrderSchema,
  updateOrderStatusSchema,
  updateStockSchema,
} from "../schemas";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      full_name: "John Doe",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      full_name: "John Doe",
      password: "password123",
      phone: "+905551234567",
      address: "123 Main St",
      city: "Istanbul",
      country: "TR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      full_name: "John Doe",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password (< 6 chars)", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      full_name: "John Doe",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short full_name (< 2 chars)", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      full_name: "J",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  it("accepts valid order with number types", () => {
    const result = createOrderSchema.safeParse({
      items: [{ watch_id: 1, quantity: 2, unit_price: 299.99 }],
    });
    expect(result.success).toBe(true);
  });

  it("coerces string numbers from PostgreSQL DECIMAL columns", () => {
    const result = createOrderSchema.safeParse({
      items: [{ watch_id: "1", quantity: "2", unit_price: "299.99" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].unit_price).toBe(299.99);
      expect(result.data.items[0].watch_id).toBe(1);
      expect(result.data.items[0].quantity).toBe(2);
    }
  });

  it("rejects empty items array", () => {
    const result = createOrderSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = createOrderSchema.safeParse({
      items: [{ watch_id: 1, quantity: -1, unit_price: 299.99 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric string for price", () => {
    const result = createOrderSchema.safeParse({
      items: [{ watch_id: 1, quantity: 1, unit_price: "abc" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("createPaymentIntentSchema", () => {
  it("accepts valid payment intent data", () => {
    const result = createPaymentIntentSchema.safeParse({
      amount: 299.99,
      order_id: 1,
    });
    expect(result.success).toBe(true);
  });

  it("defaults currency to usd", () => {
    const result = createPaymentIntentSchema.safeParse({
      amount: 100,
      order_id: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("usd");
    }
  });

  it("rejects negative amount", () => {
    const result = createPaymentIntentSchema.safeParse({
      amount: -10,
      order_id: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateOrderStatusSchema", () => {
  it.each(["pending", "processing", "shipped", "delivered", "cancelled"])(
    "accepts status: %s",
    (status) => {
      const result = updateOrderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  );

  it("rejects invalid status", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });
});

describe("updateStockSchema", () => {
  it("accepts valid stock quantity", () => {
    const result = updateStockSchema.safeParse({ stock_quantity: 10 });
    expect(result.success).toBe(true);
  });

  it("accepts zero stock (out of stock)", () => {
    const result = updateStockSchema.safeParse({ stock_quantity: 0 });
    expect(result.success).toBe(true);
  });

  it("coerces string stock quantity", () => {
    const result = updateStockSchema.safeParse({ stock_quantity: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock_quantity).toBe(5);
    }
  });

  it("rejects negative stock", () => {
    const result = updateStockSchema.safeParse({ stock_quantity: -1 });
    expect(result.success).toBe(false);
  });
});

describe("confirmOrderSchema", () => {
  it("accepts valid confirm order data", () => {
    const result = confirmOrderSchema.safeParse({
      payment_intent_id: "pi_test_123",
      order_id: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty payment_intent_id", () => {
    const result = confirmOrderSchema.safeParse({
      payment_intent_id: "",
      order_id: 1,
    });
    expect(result.success).toBe(false);
  });
});
