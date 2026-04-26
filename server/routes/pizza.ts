import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { PoolClient } from "pg";
import pool from "../db";
import validate from "../middleware/validate";
import { createPizzaOrderSchema, pizzaCheckoutSchema, pizzaPaypalCaptureSchema } from "../schemas";
import { ordersCreatedTotal, ordersRevenueDollars } from "../middleware/metrics";
import { tasks } from "@trigger.dev/sdk/v3";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

function getPaypalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret, apiBase };
}

async function getPaypalAccessToken() {
  const config = getPaypalConfig();
  if (!config) {
    return null;
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await fetch(`${config.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal");
  }

  const data = (await response.json()) as { access_token: string };
  return { accessToken: data.access_token, apiBase: config.apiBase };
}

type PizzaOrderItem = {
  pizza_id: string;
  quantity: number;
  unit_price: number;
  options: Record<string, unknown>;
};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

const extractCustomerId = (authHeader?: string) => {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as { customer_id: number };
    return decoded.customer_id;
  } catch {
    return null;
  }
};

const getTotalAmount = (items: PizzaOrderItem[]) =>
  items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

const ensurePizzaItemsAreValid = (items: PizzaOrderItem[]) => {
  for (const item of items) {
    if (item.unit_price <= 0 || item.quantity < 1) {
      throw new Error("Invalid item price or quantity");
    }
  }
};

const createPizzaOrderRecord = async (
  client: PoolClient,
  items: PizzaOrderItem[],
  deliveryAddress: string | undefined,
  customerId: number | null
) => {
  const totalAmount = getTotalAmount(items);

  const orderResult = await client.query(
    "INSERT INTO orders (total_amount, status, shipping_address, customer_id) VALUES ($1, $2, $3, $4) RETURNING order_id",
    [totalAmount, "pending", deliveryAddress ?? "", customerId]
  );
  const orderId = orderResult.rows[0].order_id as number;

  for (const item of items) {
    await client.query(
      "INSERT INTO order_items (order_id, pizza_id, quantity, unit_price, subtotal, options) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        orderId,
        item.pizza_id,
        item.quantity,
        item.unit_price,
        item.unit_price * item.quantity,
        item.options,
      ]
    );
  }

  return { orderId, totalAmount };
};

const triggerOrderConfirmation = (
  orderId: number,
  customerId: number | null,
  items: PizzaOrderItem[],
  totalAmount: number,
  deliveryAddress?: string
) => {
  tasks
    .trigger("order-confirmation", {
      orderId,
      customerId,
      items,
      totalAmount,
      shippingAddress: deliveryAddress,
    })
    .catch((error) => console.error("order-confirmation trigger failed:", error));
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pizzas WHERE is_available = true ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM pizzas WHERE pizza_id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Pizza not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/orders", validate(createPizzaOrderSchema), async (req: Request, res: Response) => {
  const { items, delivery_address } = req.body as {
    items: PizzaOrderItem[];
    delivery_address?: string;
  };

  const customerId = extractCustomerId(req.headers.authorization);
  const client = await pool.connect();

  try {
    ensurePizzaItemsAreValid(items);
    await client.query("BEGIN");

    const { orderId, totalAmount } = await createPizzaOrderRecord(
      client,
      items,
      delivery_address,
      customerId
    );

    await client.query("COMMIT");

    triggerOrderConfirmation(orderId, customerId, items, totalAmount, delivery_address);
    ordersCreatedTotal.inc();
    ordersRevenueDollars.inc(totalAmount);

    res.status(201).json({ order_id: orderId, total_amount: totalAmount, status: "pending" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Pizza order error:", (err as Error).message);
    res.status(500).json({ error: "Order could not be created" });
  } finally {
    client.release();
  }
});

router.post("/checkout", validate(pizzaCheckoutSchema), async (req: Request, res: Response) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ message: "Payment provider not configured" });
    return;
  }

  const { items, delivery_address } = req.body as {
    items: PizzaOrderItem[];
    delivery_address?: string;
  };

  const customerId = extractCustomerId(req.headers.authorization);
  const client = await pool.connect();

  try {
    ensurePizzaItemsAreValid(items);
    await client.query("BEGIN");

    const { orderId, totalAmount } = await createPizzaOrderRecord(
      client,
      items,
      delivery_address,
      customerId
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: String(orderId), customer_id: String(customerId ?? "guest") },
    });

    await client.query("COMMIT");

    ordersCreatedTotal.inc();
    ordersRevenueDollars.inc(totalAmount);
    triggerOrderConfirmation(orderId, customerId, items, totalAmount, delivery_address);

    res.status(201).json({
      order_id: orderId,
      total_amount: totalAmount,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Pizza checkout error:", (err as Error).message);
    res.status(500).json({ message: "Checkout failed", error: (err as Error).message });
  } finally {
    client.release();
  }
});

router.post(
  "/paypal-checkout",
  validate(pizzaCheckoutSchema),
  async (req: Request, res: Response) => {
    const paypal = await getPaypalAccessToken();
    if (!paypal) {
      res.status(503).json({ message: "PayPal is not configured" });
      return;
    }

    const { items, delivery_address } = req.body as {
      items: PizzaOrderItem[];
      delivery_address?: string;
    };

    const customerId = extractCustomerId(req.headers.authorization);
    const client = await pool.connect();

    try {
      ensurePizzaItemsAreValid(items);
      await client.query("BEGIN");

      const { orderId, totalAmount } = await createPizzaOrderRecord(
        client,
        items,
        delivery_address,
        customerId
      );

      const paypalResponse = await fetch(`${paypal.apiBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paypal.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: String(orderId),
              custom_id: String(orderId),
              amount: {
                currency_code: "EUR",
                value: totalAmount.toFixed(2),
              },
            },
          ],
        }),
      });

      const paypalData = (await paypalResponse.json()) as { id?: string; message?: string };
      if (!paypalResponse.ok || !paypalData.id) {
        throw new Error(paypalData.message || "PayPal checkout could not be created");
      }

      await client.query("COMMIT");

      ordersCreatedTotal.inc();
      ordersRevenueDollars.inc(totalAmount);
      triggerOrderConfirmation(orderId, customerId, items, totalAmount, delivery_address);

      res.status(201).json({
        order_id: orderId,
        total_amount: totalAmount,
        paypalOrderId: paypalData.id,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Pizza PayPal checkout error:", (err as Error).message);
      res.status(500).json({ message: "Checkout failed", error: (err as Error).message });
    } finally {
      client.release();
    }
  }
);

router.post(
  "/paypal-capture",
  validate(pizzaPaypalCaptureSchema),
  async (req: Request, res: Response) => {
    const paypal = await getPaypalAccessToken();
    if (!paypal) {
      res.status(503).json({ message: "PayPal is not configured" });
      return;
    }

    const { paypal_order_id, order_id } = req.body as {
      paypal_order_id: string;
      order_id: number;
    };

    try {
      const paypalResponse = await fetch(
        `${paypal.apiBase}/v2/checkout/orders/${paypal_order_id}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paypal.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paypalData = (await paypalResponse.json()) as {
        id?: string;
        status?: string;
        message?: string;
      };

      if (!paypalResponse.ok) {
        throw new Error(paypalData.message || "PayPal capture failed");
      }

      if (paypalData.status !== "COMPLETED") {
        res.status(400).json({ error: "PayPal payment not completed" });
        return;
      }

      await pool.query(
        "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE order_id = $3",
        ["processing", paypalData.id ?? paypal_order_id, order_id]
      );

      res.json({ success: true, order_id, status: "processing" });
    } catch (err) {
      console.error("Pizza PayPal capture error:", (err as Error).message);
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

export default router;
