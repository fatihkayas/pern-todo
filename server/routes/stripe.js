const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/confirm-order - Ödeme sonrası siparişi güncelle
router.post("/confirm-order", async (req, res) => {
  const { payment_intent_id, order_id } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not completed" });
    }
    await pool.query(
      "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE order_id = $3",
      ["processing", payment_intent_id, order_id]
    );
    res.json({ success: true, order_id, status: "processing" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
