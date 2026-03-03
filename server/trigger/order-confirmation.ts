import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import pool from "../db";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@seikostore.com";

export type OrderConfirmationPayload = {
  orderId: number;
  customerId: number | null;
  items: { watch_id: number; quantity: number; unit_price: number }[];
  totalAmount: number;
  shippingAddress?: string;
};

export const orderConfirmation = task({
  id: "order-confirmation",
  run: async (payload: OrderConfirmationPayload) => {
    const { orderId, customerId, items, totalAmount } = payload;

    // Fetch customer email
    let toEmail = ADMIN_EMAIL;
    let customerName = "Valued Customer";
    if (customerId) {
      const customerResult = await pool.query(
        "SELECT email, full_name FROM customers WHERE customer_id = $1",
        [customerId]
      );
      if (customerResult.rows.length > 0) {
        toEmail = customerResult.rows[0].email as string;
        customerName = customerResult.rows[0].full_name as string;
      }
    }

    // Fetch watch names for the ordered items
    const watchIds = items.map((i) => i.watch_id);
    const watchResult = await pool.query(
      "SELECT watch_id, watch_name, brand FROM watches WHERE watch_id = ANY($1)",
      [watchIds]
    );
    const watchMap = new Map(watchResult.rows.map((w) => [w.watch_id as number, w]));

    const itemLines = items
      .map((item) => {
        const watch = watchMap.get(item.watch_id);
        const name = watch ? `${watch.brand} ${watch.watch_name}` : `Watch #${item.watch_id}`;
        return `- ${name} x${item.quantity} ($${item.unit_price.toFixed(2)} each)`;
      })
      .join("\n");

    // Generate personalized message via Ollama
    let personalMessage = `Thank you for your order #${orderId}! We're excited to get your watches to you.`;
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: `Write a warm, personalized 2-3 sentence thank-you message for a customer named ${customerName} who just ordered these Seiko watches:\n${itemLines}\nTotal: $${totalAmount.toFixed(2)}\nBe friendly, mention the specific items, and express excitement about their purchase. Do not use markdown.`,
            },
          ],
          stream: false,
        }),
      });
      if (ollamaRes.ok) {
        const data = (await ollamaRes.json()) as { message?: { content?: string } };
        if (data.message?.content) personalMessage = data.message.content;
      }
    } catch {
      // fallback to default message
    }

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Seiko Store <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Order Confirmation #${orderId} — Seiko Store`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">⌚ Order Confirmed!</h2>
          <p>${personalMessage}</p>
          <h3>Order #${orderId}</h3>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${itemLines}</pre>
          <p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>
          <hr/>
          <p style="color:#888;font-size:12px;">Seiko Store — Questions? support@seikostore.com</p>
        </div>
      `,
    });

    return { orderId, toEmail, success: true };
  },
});
