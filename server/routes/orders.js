const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { items, shipping_address } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Sepet bos" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total_amount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const orderResult = await client.query(
      "INSERT INTO orders (total_amount, status, shipping_address) VALUES ($1, $2, $3) RETURNING order_id",
      [total_amount, "pending", shipping_address || ""]
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

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Bu rota ödeme işlemini başlatmak için bir 'Secret' anahtar oluşturur
router.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body; // Müşterinin ödeyeceği tutar

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Kuruş cinsinden (örn: 5000 = 50.00$)
      currency: "usd", // Para birimi
    });

    // İstemciye (Frontend) bu gizli anahtarı gönderiyoruz
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});