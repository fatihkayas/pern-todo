import express, { Request, Response } from "express";
import pool from "../db";

const router = express.Router();

// POST /api/checkout
// Legacy checkout route — kept for backwards compatibility
// NOTE: stock_movements and invoices tables must exist in DB
router.post("/", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { customer, items } = req.body as {
      customer?: {
        email?: string;
        full_name?: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
      };
      items?: { watch_id: number; quantity: number }[];
    };

    if (!customer?.email || !customer?.full_name || !items?.length) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    await client.query("BEGIN");

    let customerId: number;
    const existingCustomer = await client.query<{ customer_id: number }>(
      "SELECT customer_id FROM customers WHERE email = $1",
      [customer.email]
    );

    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].customer_id;
    } else {
      const newCustomer = await client.query<{ customer_id: number }>(
        `INSERT INTO customers (email, full_name, phone, address, city, country)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING customer_id`,
        [customer.email, customer.full_name, customer.phone, customer.address, customer.city, customer.country]
      );
      customerId = newCustomer.rows[0].customer_id;
    }

    let totalAmount = 0;
    const orderItems: {
      watch_id: number;
      watch_name: string;
      quantity: number;
      unit_price: string;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const watch = await client.query<{
        watch_id: number;
        watch_name: string;
        price: string;
        stock_quantity: number;
      }>(
        "SELECT watch_id, watch_name, price, stock_quantity FROM watches WHERE watch_id = $1",
        [item.watch_id]
      );

      if (watch.rows.length === 0) {
        await client.query("ROLLBACK");
        res.status(404).json({ error: `Watch not found: ${item.watch_id}` });
        return;
      }

      const watchData = watch.rows[0];
      if (watchData.stock_quantity < item.quantity) {
        await client.query("ROLLBACK");
        res.status(400).json({
          error: `Insufficient stock for ${watchData.watch_name}. Available: ${watchData.stock_quantity}`,
        });
        return;
      }

      const subtotal = parseFloat(watchData.price) * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        watch_id: watchData.watch_id,
        watch_name: watchData.watch_name,
        quantity: item.quantity,
        unit_price: watchData.price,
        subtotal,
      });
    }

    const order = await client.query<{ order_id: number; order_date: Date }>(
      `INSERT INTO orders (customer_id, total_amount, status, shipping_address)
       VALUES ($1, $2, 'pending', $3) RETURNING order_id, order_date`,
      [customerId, totalAmount, customer.address]
    );
    const orderId = order.rows[0].order_id;

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, watch_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.watch_id, item.quantity, item.unit_price, item.subtotal]
      );
    }

    for (const item of items) {
      await client.query(
        "UPDATE watches SET stock_quantity = stock_quantity - $1 WHERE watch_id = $2",
        [item.quantity, item.watch_id]
      );
      await client.query(
        `INSERT INTO stock_movements (watch_id, quantity_change, movement_type, reference_id, notes)
         VALUES ($1, $2, 'sale', $3, $4)`,
        [item.watch_id, -item.quantity, orderId, `Order #${orderId}`]
      );
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(orderId).padStart(5, "0")}`;
    await client.query(
      `INSERT INTO invoices (order_id, invoice_number, total) VALUES ($1, $2, $3)`,
      [orderId, invoiceNumber, totalAmount]
    );

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      order_id: orderId,
      invoice_number: invoiceNumber,
      total: totalAmount,
      items: orderItems,
      message: "Order created successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Checkout failed", details: (err as Error).message });
  } finally {
    client.release();
  }
});

// GET /api/checkout/orders/:id
router.get("/orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await pool.query(
      `SELECT o.*, c.email, c.full_name, c.phone
       FROM orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.order_id = $1`,
      [id]
    );
    if (order.rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const items = await pool.query(
      `SELECT oi.*, w.watch_name, w.brand
       FROM order_items oi
       JOIN watches w ON oi.watch_id = w.watch_id
       WHERE oi.order_id = $1`,
      [id]
    );
    res.json({ order: order.rows[0], items: items.rows });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ error: "Failed to get order" });
  }
});

export default router;
