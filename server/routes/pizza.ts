import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import { createPizzaOrderSchema } from "../schemas";
import { ordersCreatedTotal, ordersRevenueDollars } from "../middleware/metrics";
import { tasks } from "@trigger.dev/sdk/v3";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// GET /api/v1/pizza — tüm pizzaları listele
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pizzas WHERE is_available = true ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/pizza/:id — tek pizza detayı
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pizzas WHERE pizza_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pizza not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/v1/pizza/orders — pizza siparişi oluştur
// Mevcut orders + order_items tablolarını kullanır, pizza_id + options kolonlarıyla
router.post("/orders", validate(createPizzaOrderSchema), async (req: Request, res: Response) => {
  const { items, delivery_address } = req.body as {
    items: {
      pizza_id: string;
      quantity: number;
      unit_price: number;
      options: {
        size: string;
        toppings: string[];
        side?: string;
        sauces?: string[];
        drink?: string;
      };
    }[];
    delivery_address?: string;
  };

  // Token varsa customer'ı al (anonim checkout da desteklenir — watch ile aynı davranış)
  let customerId: number | null = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as { customer_id: number };
      customerId = decoded.customer_id;
    } catch {
      // anonim checkout — sorun değil
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const total_amount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const orderResult = await client.query(
      "INSERT INTO orders (total_amount, status, shipping_address, customer_id) VALUES ($1, $2, $3, $4) RETURNING order_id",
      [total_amount, "pending", delivery_address ?? "", customerId]
    );
    const order_id = orderResult.rows[0].order_id;

    for (const item of items) {
      const subtotal = item.unit_price * item.quantity;
      // pizza_id + options kolonlarını kullan, watch_id NULL kalır
      await client.query(
        `INSERT INTO order_items (order_id, pizza_id, quantity, unit_price, subtotal, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order_id, item.pizza_id, item.quantity, item.unit_price, subtotal, item.options]
      );
    }

    await client.query("COMMIT");

    // Mevcut Trigger.dev order-confirmation task'ını yeniden kullan
    tasks
      .trigger("order-confirmation", {
        orderId: order_id,
        customerId,
        items,
        totalAmount: total_amount,
        shippingAddress: delivery_address,
      })
      .catch((e) => console.error("order-confirmation trigger failed:", e));

    // Paylaşılan Prometheus metriklerini artır
    ordersCreatedTotal.inc();
    ordersRevenueDollars.inc(total_amount);

    res.status(201).json({ order_id, total_amount, status: "pending" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Pizza order error:", (err as Error).message);
    res.status(500).json({ error: "Sipariş oluşturulamadı" });
  } finally {
    client.release();
  }
});

export default router;
