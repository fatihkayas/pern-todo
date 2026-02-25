import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas";
import { Customer } from "../types";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, full_name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               full_name: { type: string }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               country: { type: string }
 *     responses:
 *       201:
 *         description: Customer registered, JWT token returned
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already registered
 */
// POST /api/auth/register
router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  const { email, full_name, password, phone, address, city, country } = req.body as {
    email: string;
    full_name: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  try {
    const exists = await pool.query<{ customer_id: number }>(
      "SELECT customer_id FROM customers WHERE email = $1",
      [email]
    );
    if (exists.rows.length > 0) {
      res.status(409).json({ error: "Bu email zaten kayıtlı" });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query<Pick<Customer, "customer_id" | "email" | "full_name">>(
      "INSERT INTO customers (email, full_name, password_hash, phone, address, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING customer_id, email, full_name",
      [
        email,
        full_name,
        password_hash,
        phone ?? null,
        address ?? null,
        city ?? null,
        country ?? null,
      ]
    );
    const customer = result.rows[0];
    const token = jwt.sign(
      { customer_id: customer.customer_id, email: customer.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, customer });
  } catch (err) {
    console.error("Register error:", (err as Error).message);
    res.status(500).json({ error: "Kayıt hatası" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT token and customer info
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid credentials
 */
// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const result = await pool.query<Customer>("SELECT * FROM customers WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Email veya şifre hatalı" });
      return;
    }
    const customer = result.rows[0];
    if (!customer.password_hash) {
      res.status(401).json({ error: "Email veya şifre hatalı" });
      return;
    }
    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Email veya şifre hatalı" });
      return;
    }
    const token = jwt.sign(
      { customer_id: customer.customer_id, email: customer.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      customer: {
        customer_id: customer.customer_id,
        email: customer.email,
        full_name: customer.full_name,
      },
    });
  } catch (err) {
    console.error("Login error:", (err as Error).message);
    res.status(500).json({ error: "Giriş hatası" });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated customer
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Decoded customer info from JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_id: { type: integer }
 *                 email: { type: string }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/auth/me
router.get("/me", (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token gerekli" });
    return;
  }
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { customer_id: number; email: string };
    res.json({ customer_id: decoded.customer_id, email: decoded.email });
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
});

export default router;
