import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express, { Request, Response } from "express";
import cors from "cors";
import pool from "./db";
import "dotenv/config";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import client from "prom-client";
import { metricsMiddleware, register } from "./middleware/metrics";
import { httpLogger, correlationMiddleware } from "./middleware/logger";
import chatRouter from "./routes/chat";
import checkoutRouter from "./routes/checkout";
import stripeRouter from "./routes/stripe";
import paypalRouter from "./routes/paypal";
import adminRouter from "./routes/admin";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";

// Stock gauge — async collect queries DB on every Prometheus scrape
new client.Gauge({
  name: "watches_low_stock_total",
  help: "Number of watches with stock_quantity below threshold (< 3)",
  registers: [register],
  async collect() {
    try {
      const result = await pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM watches WHERE stock_quantity < 3"
      );
      this.set(parseInt(result.rows[0].count, 10));
    } catch {
      // DB may not be ready yet — skip silently
    }
  },
});

const app = express();
app.set("trust proxy", 1);
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "https://localhost:8443",
  "http://localhost:3000",
  ...configuredOrigins,
]);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Chat status polling can fire ~120 req/message — skip it from the global limiter
  skip: (req) => req.method === "GET" && req.path.startsWith("/chat/"),
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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use("/api/v1", limiter);
app.use("/api/v1/auth", authLimiter);
// Chat polling (GET /api/v1/chat/:runId) is exempt — can fire 120 req/message

// Stripe webhook requires raw body — must be registered BEFORE express.json()
app.use("/api/v1/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(correlationMiddleware);
app.use(httpLogger);
app.use(metricsMiddleware);

/**
 * @swagger
 * /watches:
 *   get:
 *     summary: Get all watches
 *     tags: [Watches]
 *     responses:
 *       200:
 *         description: List of all watches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Watch'
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/api/v1/watches", async (req: Request, res: Response) => {
  const category = ((req.query.category as string) || "").trim().toLowerCase();
  const brand = ((req.query.brand as string) || "").trim();
  const search = ((req.query.search as string) || "").trim();
  const sort = ((req.query.sort as string) || "").trim();
  const minPrice = parseFloat(req.query.min_price as string) || 0;
  const maxPrice = parseFloat(req.query.max_price as string) || 0;
  const inStock = req.query.in_stock === "1";
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);
  const paginate = !isNaN(rawPage) || !isNaN(rawLimit);
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
  const limit = Math.min(200, Math.max(1, isNaN(rawLimit) ? 24 : rawLimit));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (category) {
    conditions.push(`LOWER(category) = $${idx++}`);
    params.push(category);
  }
  if (brand) {
    conditions.push(`brand = $${idx++}`);
    params.push(brand);
  }
  if (search) {
    conditions.push(
      `(LOWER(watch_name) LIKE $${idx} OR LOWER(brand) LIKE $${idx} OR LOWER(COALESCE(model_code,'')) LIKE $${idx})`
    );
    params.push(`%${search.toLowerCase()}%`);
    idx++;
  }
  if (minPrice > 0) {
    conditions.push(`price::numeric >= $${idx++}`);
    params.push(minPrice);
  }
  if (maxPrice > 0) {
    conditions.push(`price::numeric <= $${idx++}`);
    params.push(maxPrice);
  }
  if (inStock) {
    conditions.push(`stock_quantity > 0`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy =
    sort === "preis-asc"
      ? "price::numeric ASC"
      : sort === "preis-desc"
        ? "price::numeric DESC"
        : sort === "name-az"
          ? "watch_name ASC"
          : "watch_id DESC";

  try {
    if (paginate) {
      const [data, count] = await Promise.all([
        pool.query(
          `SELECT * FROM watches ${where} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
          [...params, limit, offset]
        ),
        pool.query(`SELECT COUNT(*)::int AS total FROM watches ${where}`, params),
      ]);
      const total = count.rows[0].total as number;
      res.json({ watches: data.rows, total, page, pages: Math.ceil(total / limit) });
    } else {
      const result = await pool.query(`SELECT * FROM watches ${where} ORDER BY ${orderBy}`, params);
      res.json(result.rows);
    }
  } catch (err) {
    console.error("DB Error:", (err as Error).message);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/watches/brands-summary — brand-grouped homepage data (6 watches per brand)
// MUST be before /:id
app.get("/api/v1/watches/brands-summary", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      WITH ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY brand ORDER BY watch_id DESC) AS rn
        FROM watches
      ),
      counts AS (
        SELECT brand, COUNT(*)::int AS cnt FROM watches GROUP BY brand
      )
      SELECT r.*, c.cnt AS brand_count
      FROM ranked r
      JOIN counts c ON r.brand = c.brand
      WHERE r.rn <= 6
      ORDER BY c.cnt DESC, r.brand, r.rn
    `);

    const grouped = new Map<string, { brand: string; count: number; watches: unknown[] }>();
    for (const row of result.rows) {
      if (!grouped.has(row.brand)) {
        grouped.set(row.brand, { brand: row.brand, count: row.brand_count, watches: [] });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { brand_count, rn, ...watch } = row;
      grouped.get(row.brand)!.watches.push(watch);
    }
    res.json(Array.from(grouped.values()));
  } catch (err) {
    console.error("DB Error:", (err as Error).message);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/v1/watches/brands?category=X — distinct brands with counts
// MUST be before /:id
app.get("/api/v1/watches/brands", async (req: Request, res: Response) => {
  const category = ((req.query.category as string) || "").trim().toLowerCase();
  try {
    const result = category
      ? await pool.query(
          `SELECT brand, COUNT(*)::int AS count FROM watches WHERE LOWER(category) = $1 GROUP BY brand ORDER BY count DESC`,
          [category]
        )
      : await pool.query(
          `SELECT brand, COUNT(*)::int AS count FROM watches GROUP BY brand ORDER BY count DESC`
        );
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", (err as Error).message);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * @swagger
 * /watches/{id}:
 *   get:
 *     summary: Get single watch by ID
 *     tags: [Watches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Watch object
 *       404:
 *         description: Not found
 *       500:
 *         description: Database error
 */
app.get("/api/v1/watches/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: "Invalid watch ID" });
    return;
  }
  try {
    const result = await pool.query("SELECT * FROM watches WHERE watch_id = $1", [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Watch not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", (err as Error).message);
    res.status(500).json({ error: "Database error" });
  }
});

app.use("/api/v1/stripe", stripeRouter);
app.use("/api/v1/paypal", paypalRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/checkout", checkoutRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

app.get("/ready", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable", reason: "database unreachable" });
  }
});

app.get("/metrics", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
