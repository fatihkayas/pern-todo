import express, { Request, Response } from "express";
import pool from "../db";
import validate from "../middleware/validate";
import { capturePaypalOrderSchema, createPaymentIntentSchema } from "../schemas";

const router = express.Router();

const getPaypalConfig = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret, apiBase };
};

const getPaypalAccessToken = async () => {
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
};

router.post(
  "/create-order",
  validate(createPaymentIntentSchema),
  async (req: Request, res: Response) => {
    const paypal = await getPaypalAccessToken();
    if (!paypal) {
      res.status(503).json({ error: "PayPal is not configured" });
      return;
    }

    const { amount, order_id, currency } = req.body as {
      amount: number;
      order_id: number;
      currency: string;
    };

    try {
      const response = await fetch(`${paypal.apiBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paypal.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: String(order_id),
              custom_id: String(order_id),
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
              },
            },
          ],
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string };

      if (!response.ok || !data.id) {
        res.status(500).json({ error: data.message || "Failed to create PayPal order" });
        return;
      }

      res.json({ orderId: data.id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

router.post(
  "/capture-order",
  validate(capturePaypalOrderSchema),
  async (req: Request, res: Response) => {
    const paypal = await getPaypalAccessToken();
    if (!paypal) {
      res.status(503).json({ error: "PayPal is not configured" });
      return;
    }

    const { paypal_order_id, order_id } = req.body as {
      paypal_order_id: string;
      order_id: number;
    };

    try {
      const response = await fetch(
        `${paypal.apiBase}/v2/checkout/orders/${paypal_order_id}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paypal.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as {
        status?: string;
        id?: string;
        message?: string;
      };

      if (!response.ok) {
        res.status(500).json({ error: data.message || "Failed to capture PayPal order" });
        return;
      }

      if (data.status !== "COMPLETED") {
        res.status(400).json({ error: "PayPal payment not completed" });
        return;
      }

      await pool.query(
        "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE order_id = $3",
        ["processing", data.id ?? paypal_order_id, order_id]
      );

      res.json({ success: true, order_id, status: "processing" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

export default router;
