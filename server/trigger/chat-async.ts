import { task } from "@trigger.dev/sdk/v3";
import pool from "../db";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export type ChatPayload = {
  messages: { role: string; content: string }[];
};

export const chatAsync = task({
  id: "chat-async",
  maxDuration: 120,
  run: async (payload: ChatPayload) => {
    const { messages } = payload;

    let inventoryText = "No items found.";
    try {
      const result = await pool.query("SELECT * FROM watches LIMIT 50");
      if (result.rows.length > 0) {
        inventoryText = result.rows
          .map(
            (w) =>
              `- ${(w.watch_name as string) || ""} (${(w.brand as string) || ""}, $${(w.price as string) || ""})`
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

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...trimmedMessages],
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);

    const data = (await response.json()) as { message?: { content?: string } };
    const text = data.message?.content || "Sorry, I could not generate a response.";

    return { text };
  },
});
