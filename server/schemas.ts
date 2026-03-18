import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  full_name: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        watch_id: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
        unit_price: z.coerce.number().positive(),
      })
    )
    .min(1),
  shipping_address: z.string().optional(),
});

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  order_id: z.number().int().positive(),
  currency: z.string().length(3).optional().default("usd"),
});

export const confirmOrderSchema = z.object({
  payment_intent_id: z.string().min(1),
  order_id: z.number().int().positive(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

export const updateStockSchema = z.object({
  stock_quantity: z.coerce.number().int().min(0),
});

export const createPizzaOrderSchema = z.object({
  items: z
    .array(
      z.object({
        pizza_id: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
        unit_price: z.coerce.number().positive(),
        options: z.object({
          size: z.string().min(1),
          toppings: z.array(z.string()).default([]),
          side: z.string().optional(),
          sauces: z.array(z.string()).optional(),
          drink: z.string().optional(),
        }),
      })
    )
    .min(1),
  delivery_address: z.string().optional(),
});
