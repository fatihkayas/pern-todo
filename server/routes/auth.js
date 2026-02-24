const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas");

const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, full_name, password, phone, address, city, country } = req.body;
  try {
    const exists = await pool.query("SELECT customer_id FROM customers WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Bu email zaten kayıtlı" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO customers (email, full_name, password_hash, phone, address, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING customer_id, email, full_name",
      [email, full_name, password_hash, phone || null, address || null, city || null, country || null]
    );
    const customer = result.rows[0];
    const token = jwt.sign({ customer_id: customer.customer_id, email: customer.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, customer });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Kayıt hatası" });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM customers WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }
    const customer = result.rows[0];
    if (!customer.password_hash) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }
    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Email veya şifre hatalı" });
    }
    const token = jwt.sign({ customer_id: customer.customer_id, email: customer.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, customer: { customer_id: customer.customer_id, email: customer.email, full_name: customer.full_name } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Giriş hatası" });
  }
});

// GET /api/auth/me - Token doğrula
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token gerekli" });
  }
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ customer_id: decoded.customer_id, email: decoded.email });
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
});

module.exports = router;
