const { z } = require("zod");

const registerSchema = z.object({
  email: z.email(),
  full_name: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        watch_id: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        unit_price: z.coerce.number().positive(),
      })
    )
    .min(1),
  shipping_address: z.string().optional(),
});

const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  order_id: z.number().int().positive(),
  currency: z.string().length(3).optional().default("usd"),
});

const confirmOrderSchema = z.object({
  payment_intent_id: z.string().min(1),
  order_id: z.number().int().positive(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

const updateStockSchema = z.object({
  stock_quantity: z.coerce.number().int().min(0),
});

module.exports = {
  registerSchema,
  loginSchema,
  createOrderSchema,
  createPaymentIntentSchema,
  confirmOrderSchema,
  updateOrderStatusSchema,
  updateStockSchema,
};
