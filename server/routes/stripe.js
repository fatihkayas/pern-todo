const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");
const validate = require("../middleware/validate");
const { createPaymentIntentSchema, confirmOrderSchema } = require("../schemas");

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", validate(createPaymentIntentSchema), async (req, res) => {
  const { amount, currency } = req.body;
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
router.post("/confirm-order", validate(confirmOrderSchema), async (req, res) => {
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
