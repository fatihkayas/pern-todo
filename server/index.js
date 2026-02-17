const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

// Routes
const chatRouter = require("./routes/chat");

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- USER ROUTES ---
app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Could not fetch users" });
  }
});

// --- WATCH ROUTES ---
app.get("/watches", async (req, res) => {
  try {
    const allWatches = await pool.query("SELECT * FROM watches");
    res.json(allWatches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Could not fetch watches" });
  }
});

// --- CHAT ROUTE ---
app.use("/api/chat", chatRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
