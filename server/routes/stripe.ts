import express, { Request, Response } from "express";
import Stripe from "stripe";
import pool from "../db";
import validate from "../middleware/validate";
import { createPaymentIntentSchema, confirmOrderSchema } from "../schemas";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// POST /api/stripe/create-payment-intent
router.post(
  "/create-payment-intent",
  validate(createPaymentIntentSchema),
  async (req: Request, res: Response) => {
    const { amount, order_id, currency } = req.body as {
      amount: number;
      order_id: number;
      currency: string;
    };
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: { order_id: String(order_id) },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error("Stripe error:", (err as Error).message);
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// POST /api/stripe/webhook
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send("Missing stripe-signature or webhook secret");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", (err as Error).message);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
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

// POST /api/stripe/confirm-order
router.post(
  "/confirm-order",
  validate(confirmOrderSchema),
  async (req: Request, res: Response) => {
    const { payment_intent_id, order_id } = req.body as {
      payment_intent_id: string;
      order_id: number;
    };
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      if (paymentIntent.status !== "succeeded") {
        res.status(400).json({ error: "Payment not completed" });
        return;
      }
      await pool.query(
        "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE order_id = $3",
        ["processing", payment_intent_id, order_id]
      );
      res.json({ success: true, order_id, status: "processing" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

export default router;
