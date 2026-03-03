import express, { Request, Response } from "express";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { chatRequestsTotal, chatDurationMs } from "../middleware/metrics";

const router = express.Router();

// POST /api/v1/chat — trigger async job, return runId
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

    const handle = await tasks.trigger("chat-async", { messages });
    chatDurationMs.observe(Date.now() - chatStart);
    res.json({ runId: handle.id });
  } catch (err) {
    console.error("Chat trigger error:", (err as Error).message);
    res.status(500).json({ error: "Chat failed. Please try again." });
  }
});

// GET /api/v1/chat/:runId — poll job status
router.get("/:runId", async (req: Request, res: Response) => {
  try {
    const runId = String(req.params.runId);
    const run = await runs.retrieve(runId);
    if (run.status === "COMPLETED") {
      const output = run.output as { text: string } | undefined;
      res.json({ status: "COMPLETED", text: output?.text ?? "" });
    } else if (run.status === "FAILED" || run.status === "CANCELED") {
      res.json({ status: "FAILED", text: "Sorry, something went wrong. Please try again." });
    } else {
      res.json({ status: run.status });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
