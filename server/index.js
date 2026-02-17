const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const { z } = require("zod");
const pool = require("./db");
require("dotenv").config();

const chatRouter = require("./routes/chat");
// Security headers — must be first
app.use(helmet());

// Rate limiting for chat endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // max 10 requests per minute
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/chat", chatLimiter);

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/users", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) { next(err); }
});

app.get("/watches", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM watches");
    res.json(result.rows);
  } catch (err) { next(err); }
});

const watchSchema = z.object({
  watch_name: z.string().min(1).max(200),
  brand: z.string().min(1).max(100),
  price: z.number().positive(),
  description: z.string().max(1000).optional(),
});

app.post("/watches", async (req, res, next) => {
  try {
    const parsed = watchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors });
    }
    const { watch_name, brand, price, description } = parsed.data;
    const result = await pool.query(
      "INSERT INTO watches (watch_name, brand, price, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [watch_name, brand, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

app.delete("/watches/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await pool.query("DELETE FROM watches WHERE id = $1", [id]);
    res.json({ message: "Watch deleted" });
  } catch (err) { next(err); }
});

app.use("/api/chat", chatRouter);

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(5000, () => console.log("Server started on port 5000"));