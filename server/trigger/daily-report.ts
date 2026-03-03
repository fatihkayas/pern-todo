import { schedules } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import pool from "../db";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@seikostore.com";

export const dailyReport = schedules.task({
  id: "daily-report",
  cron: "0 0 * * *",
  run: async () => {
    // Query today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(AVG(total_amount), 0) AS avg_order_value
       FROM orders
       WHERE order_date >= $1`,
      [today]
    );

    const topWatchesResult = await pool.query(
      `SELECT w.watch_name, w.brand, SUM(oi.quantity) AS units_sold
       FROM order_items oi
       JOIN watches w ON oi.watch_id = w.watch_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.order_date >= $1
       GROUP BY w.watch_id, w.watch_name, w.brand
       ORDER BY units_sold DESC
       LIMIT 5`,
      [today]
    );

    const stats = statsResult.rows[0] as {
      order_count: string;
      total_revenue: string;
      avg_order_value: string;
    };
    const orderCount = parseInt(stats.order_count);
    const totalRevenue = parseFloat(stats.total_revenue);
    const avgOrderValue = parseFloat(stats.avg_order_value);

    const topWatchesText =
      topWatchesResult.rows.length > 0
        ? topWatchesResult.rows
            .map((w) => `- ${w.brand} ${w.watch_name}: ${w.units_sold} units`)
            .join("\n")
        : "No sales today.";

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate narrative summary via Ollama
    let narrative = `Today you had ${orderCount} orders with $${totalRevenue.toFixed(2)} in total revenue.`;
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: "user",
              content: `Write a brief, upbeat 3-sentence daily business summary for a Seiko watch store manager. Stats for ${dateStr}: ${orderCount} orders, $${totalRevenue.toFixed(2)} revenue, $${avgOrderValue.toFixed(2)} average order value. Top sellers:\n${topWatchesText}\nBe encouraging and highlight key insights. Do not use markdown.`,
            },
          ],
          stream: false,
        }),
      });
      if (ollamaRes.ok) {
        const data = (await ollamaRes.json()) as { message?: { content?: string } };
        if (data.message?.content) narrative = data.message.content;
      }
    } catch {
      // fallback to default narrative
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Seiko Store <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `📊 Daily Report — ${dateStr}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E3A5F;">📊 Daily Store Report</h2>
          <p style="color:#555;">${dateStr}</p>
          <p>${narrative}</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;">
            <tr style="background:#1E3A5F;color:white;">
              <th style="padding:10px;text-align:left;">Metric</th>
              <th style="padding:10px;text-align:right;">Value</th>
            </tr>
            <tr><td style="padding:8px;border:1px solid #ddd;">Orders</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">${orderCount}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;">Total Revenue</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">$${totalRevenue.toFixed(2)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;">Avg Order Value</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">$${avgOrderValue.toFixed(2)}</td></tr>
          </table>
          <h3>Top Sellers</h3>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${topWatchesText}</pre>
        </div>
      `,
    });

    return { date: dateStr, orderCount, totalRevenue, success: true };
  },
});
