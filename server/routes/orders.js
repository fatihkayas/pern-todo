const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

router.post("/", async (req, res) => {
  const { items, shipping_address } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Sepet bos" });
  }
  let customerId = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
      customerId = decoded.customer_id;
    } catch {}
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total_amount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const orderResult = await client.query(
      "INSERT INTO orders (total_amount, status, shipping_address, customer_id) VALUES ($1, $2, $3, $4) RETURNING order_id",
      [total_amount, "pending", shipping_address || "", customerId]
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
    console.error("Order error:", err.message);
    res.status(500).json({ error: "Siparis olusturulamadi" });
  } finally {
    client.release();
  }
});

router.get("/my", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token gerekli" });
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const result = await pool.query(`
      SELECT o.*, json_agg(json_build_object(
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
      ORDER BY o.order_date DESC
    `, [decoded.customer_id]);
    res.json(result.rows);
  } catch {
    res.status(401).json({ error: "Gecersiz token" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query("SELECT * FROM orders WHERE order_id = $1", [id]);
    if (order.rows.length === 0) return res.status(404).json({ error: "Siparis bulunamadi" });
    const items = await pool.query(
      "SELECT oi.*, w.watch_name, w.image_url FROM order_items oi JOIN watches w ON oi.watch_id = w.watch_id WHERE oi.order_id = $1",
      [id]
    );
    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
