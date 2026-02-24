import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import { createOrderSchema } from "../schemas";
import { Order, OrderItem, Watch } from "../types";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// POST /api/orders
router.post("/", validate(createOrderSchema), async (req: Request, res: Response) => {
  const { items, shipping_address } = req.body as {
    items: { watch_id: number; quantity: number; unit_price: number }[];
    shipping_address?: string;
  };

  let customerId: number | null = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as { customer_id: number };
      customerId = decoded.customer_id;
    } catch {
      // anonymous checkout allowed
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total_amount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const orderResult = await client.query<Pick<Order, "order_id">>(
      "INSERT INTO orders (total_amount, status, shipping_address, customer_id) VALUES ($1, $2, $3, $4) RETURNING order_id",
      [total_amount, "pending", shipping_address ?? "", customerId]
    );
    const order_id = orderResult.rows[0].order_id;

    for (const item of items) {
      const subtotal = item.unit_price * item.quantity;
      await client.query(
        "INSERT INTO order_items (order_id, watch_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [order_id, item.watch_id, item.quantity, item.unit_price, subtotal]
      );
      await client.query(
        "UPDATE watches SET stock_quantity = stock_quantity - $1 WHERE watch_id = $2",
        [item.quantity, item.watch_id]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ order_id, total_amount, status: "pending" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order error:", (err as Error).message);
    res.status(500).json({ error: "Siparis olusturulamadi" });
  } finally {
    client.release();
  }
});

// GET /api/orders/my
router.get("/my", async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token gerekli" });
    return;
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as { customer_id: number };
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'watch_name', w.watch_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'subtotal', oi.subtotal
      )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN watches w ON oi.watch_id = w.watch_id
      WHERE o.customer_id = $1
      GROUP BY o.order_id
      ORDER BY o.order_date DESC`,
      [decoded.customer_id]
    );
    res.json(result.rows);
  } catch {
    res.status(401).json({ error: "Gecersiz token" });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await pool.query<Order>("SELECT * FROM orders WHERE order_id = $1", [id]);
    if (order.rows.length === 0) {
      res.status(404).json({ error: "Siparis bulunamadi" });
      return;
    }
    const items = await pool.query<OrderItem & { watch_name: string; image_url: string }>(
      "SELECT oi.*, w.watch_name, w.image_url FROM order_items oi JOIN watches w ON oi.watch_id = w.watch_id WHERE oi.order_id = $1",
      [id]
    );
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
