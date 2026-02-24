const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const pool = require("./db");
require("dotenv").config();

const chatRouter = require("./routes/chat");
const checkoutRouter = require("./routes/checkout");


app.use(helmet());
// ÖNEMLİ: Sadece bu iki adrese tam izin veriyoruz
app.use(cors({
  origin: ["https://localhost:8443", "http://localhost:3000"],
  credentials: true
}));

// Stripe webhook requires raw body — must be registered BEFORE express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/watches", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watches ORDER BY watch_id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.use("/api/stripe", require("./routes/stripe"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/chat", chatRouter);
app.use("/api/checkout", checkoutRouter);
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(5000, () => console.log("Backend 5000 portunda hazır."));
