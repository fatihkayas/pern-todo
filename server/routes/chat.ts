import express, { Request, Response } from "express";
import pool from "../db";
import { chatRequestsTotal, chatDurationMs } from "../middleware/metrics";

const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.containers.internal:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

router.post("/", async (req: Request, res: Response) => {
  chatRequestsTotal.inc();
  const chatStart = Date.now();
  try {
    const { messages } = req.body as {
      messages?: { role: string; content: string }[];
    };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    let inventoryText = "No items found.";
    try {
      const result = await pool.query("SELECT * FROM watches LIMIT 50");
      if (result.rows.length > 0) {
        inventoryText = result.rows
          .map(
            (w) =>
              `- ${(w.watch_name as string) || (w.name as string)} (${(w.brand as string) || ""}, $${(w.price as string) || ""})`
          )
          .join("\n");
      }
    } catch {
      // ignore inventory fetch errors
    }

    const systemPrompt = `You are a helpful assistant for the Seiko watch store app.

Current watch inventory:
${inventoryText}

Your responsibilities:
- Help users find watches from the inventory
- Answer questions about Seiko watches
- If the user asks for customer service, support, or a human agent, respond with:
  "Please contact our customer service team at support@seikostore.com or call +90 212 555 0100. Our team is available Monday–Friday, 9am–6pm."
- If a watch model is not in the inventory, say you don't have it and suggest similar ones
- Be concise, friendly, and helpful
- Always answer in the same language the user writes in`;

    const trimmedMessages = messages.slice(-20);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...trimmedMessages],
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder
        .decode(value)
        .split("\n")
        .filter((l) => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as {
            message?: { content?: string };
            done?: boolean;
          };
          if (parsed.message?.content) {
            res.write(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`);
          }
          if (parsed.done) res.write("data: [DONE]\n\n");
        } catch {
          // skip malformed lines
        }
      }
    }
    chatDurationMs.observe(Date.now() - chatStart);
    res.end();
  } catch (err) {
    console.error("Chat error:", (err as Error).message);
    res.status(500).json({ error: "Chat failed. Please try again." });
  }
});

export default router;
