const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");
const validate = require("../middleware/validate");
const { createPaymentIntentSchema, confirmOrderSchema } = require("../schemas");

// POST /api/stripe/create-payment-intent
router.post("/create-payment-intent", validate(createPaymentIntentSchema), async (req, res) => {
  const { amount, order_id, currency } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: String(order_id) },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/webhook - Stripe webhook handler
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const order_id = paymentIntent.metadata?.order_id;
    if (order_id) {
      await pool.query(
        "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE order_id = $3",
        ["processing", paymentIntent.id, order_id]
      );
      console.log(`Webhook: order ${order_id} marked as processing`);
    }
  }

  res.json({ received: true });
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
