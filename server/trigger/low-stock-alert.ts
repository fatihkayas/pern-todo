import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@seikostore.com";

export type LowStockPayload = {
  watchId: number;
  watchName: string;
  brand: string;
  stockQuantity: number;
};

export const lowStockAlert = task({
  id: "low-stock-alert",
  run: async (payload: LowStockPayload) => {
    const { watchId, watchName, brand, stockQuantity } = payload;

    // Generate alert message via Ollama
    let alertMessage = `Warning: ${brand} ${watchName} (ID: ${watchId}) is running low with only ${stockQuantity} units remaining. Please restock soon.`;
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: `Write a brief, urgent 2-sentence stock alert for a store manager. Product: ${brand} ${watchName} (Watch ID: ${watchId}). Current stock: ${stockQuantity} units. Be direct and actionable. Do not use markdown.`,
            },
          ],
          stream: false,
        }),
      });
      if (ollamaRes.ok) {
        const data = (await ollamaRes.json()) as { message?: { content?: string } };
        if (data.message?.content) alertMessage = data.message.content;
      }
    } catch {
      // fallback to default message
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Seiko Store <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `⚠️ Low Stock Alert: ${brand} ${watchName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">⚠️ Low Stock Alert</h2>
          <p>${alertMessage}</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Product</strong></td><td style="padding:8px;border:1px solid #ddd;">${brand} ${watchName}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Watch ID</strong></td><td style="padding:8px;border:1px solid #ddd;">${watchId}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Current Stock</strong></td><td style="padding:8px;border:1px solid #ddd;color:#c0392b;"><strong>${stockQuantity} units</strong></td></tr>
          </table>
          <p style="margin-top:16px;"><a href="#" style="background:#1E3A5F;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;">Go to Admin Panel</a></p>
        </div>
      `,
    });

    return { watchId, stockQuantity, alerted: true };
  },
});
