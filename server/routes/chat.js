const express = require("express");
const router = express.Router();
const pool = require("../db");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://host.containers.internal:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Fetch watch inventory
    let inventoryText = "No items found.";
    try {
      const result = await pool.query("SELECT * FROM watches LIMIT 50");
      if (result.rows.length > 0) {
        inventoryText = result.rows
          .map((w) => `- ${w.watch_name || w.name} (${w.brand || ""}, $${w.price || ""})`)
          .join("\n");
      }
    } catch (_) {}

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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter((l) => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            res.write(`data: ${JSON.stringify({ text: parsed.message.content })}\n\n`);
          }
          if (parsed.done) res.write("data: [DONE]\n\n");
        } catch (_) {}
      }
    }
    res.end();
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Chat failed. Please try again." });
  }
});

module.exports = router;