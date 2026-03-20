import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas";
import { Customer } from "../types";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function getBackendUrl() {
  return (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`).replace(
    /\/+$/,
    ""
  );
}

function getGoogleRedirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI || `${getBackendUrl()}/api/v1/auth/google/callback`
  ).replace(/\/+$/, "");
}

function createAuthToken(customer: Pick<Customer, "customer_id" | "email">) {
  return jwt.sign({ customer_id: customer.customer_id, email: customer.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function redirectToFrontend(res: Response, params: Record<string, string>) {
  const callbackUrl = new URL("/auth/google/callback", getFrontendUrl());
  Object.entries(params).forEach(([key, value]) => callbackUrl.searchParams.set(key, value));
  res.redirect(callbackUrl.toString());
}

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
    const token = createAuthToken(customer);
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
    const token = createAuthToken(customer);
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

router.get("/google", async (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    redirectToFrontend(res, {
      error: "google_not_configured",
      returnTo: typeof req.query.returnTo === "string" ? req.query.returnTo : "/",
    });
    return;
  }

  const returnTo =
    typeof req.query.returnTo === "string" && req.query.returnTo.startsWith("/")
      ? req.query.returnTo
      : "/";

  const state = jwt.sign({ returnTo }, JWT_SECRET, { expiresIn: "10m" });
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", getGoogleRedirectUri());
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "select_account");
  googleUrl.searchParams.set("state", state);

  res.redirect(googleUrl.toString());
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const oauthError = typeof req.query.error === "string" ? req.query.error : "";

  if (oauthError) {
    redirectToFrontend(res, { error: oauthError });
    return;
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !code || !state) {
    redirectToFrontend(res, { error: "google_callback_invalid" });
    return;
  }

  try {
    const decodedState = jwt.verify(state, JWT_SECRET) as { returnTo?: string };
    const returnTo =
      decodedState.returnTo && decodedState.returnTo.startsWith("/") ? decodedState.returnTo : "/";

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: getGoogleRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      redirectToFrontend(res, { error: tokenData.error || "google_token_exchange_failed" });
      return;
    }

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = (await userResponse.json()) as {
      email?: string;
      name?: string;
      given_name?: string;
    };

    if (!userResponse.ok || !userData.email) {
      redirectToFrontend(res, { error: "google_profile_fetch_failed" });
      return;
    }

    const fullName = userData.name || userData.given_name || userData.email;
    const existing = await pool.query<Pick<Customer, "customer_id" | "email" | "full_name">>(
      "SELECT customer_id, email, full_name FROM customers WHERE email = $1",
      [userData.email]
    );

    let customer: Pick<Customer, "customer_id" | "email" | "full_name">;

    if (existing.rows.length > 0) {
      customer = existing.rows[0];
      if (customer.full_name !== fullName) {
        const updated = await pool.query<Pick<Customer, "customer_id" | "email" | "full_name">>(
          "UPDATE customers SET full_name = $1 WHERE customer_id = $2 RETURNING customer_id, email, full_name",
          [fullName, customer.customer_id]
        );
        customer = updated.rows[0];
      }
    } else {
      const created = await pool.query<Pick<Customer, "customer_id" | "email" | "full_name">>(
        "INSERT INTO customers (email, full_name, password_hash, phone, address, city, country) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING customer_id, email, full_name",
        [userData.email, fullName, null, null, null, null, null]
      );
      customer = created.rows[0];
    }

    redirectToFrontend(res, {
      token: createAuthToken(customer),
      customer: JSON.stringify(customer),
      returnTo,
    });
  } catch (err) {
    console.error("Google auth error:", (err as Error).message);
    redirectToFrontend(res, { error: "google_auth_failed" });
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
