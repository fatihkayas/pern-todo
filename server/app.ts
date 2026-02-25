import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import pool from "./db";
import "dotenv/config";

import chatRouter from "./routes/chat";
import checkoutRouter from "./routes/checkout";
import stripeRouter from "./routes/stripe";
import adminRouter from "./routes/admin";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin: ["https://localhost:8443", "http://localhost:3000"],
    credentials: true,
  })
);

app.use("/api", limiter);
app.use("/api/auth", authLimiter);

// Stripe webhook requires raw body — must be registered BEFORE express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/watches", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM watches ORDER BY watch_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", (err as Error).message);
    res.status(500).json({ error: "Database error" });
  }
});

app.use("/api/stripe", stripeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/checkout", checkoutRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

export default app;
