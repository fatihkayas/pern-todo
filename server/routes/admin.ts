import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import {
  updateOrderStatusSchema,
  updateStockSchema,
  updateWatchSchema,
  createWatchSchema,
} from "../schemas";
import { tasks } from "@trigger.dev/sdk/v3";
import { AuthPayload } from "../types";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// Admin authentication middleware
const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token gerekli" });
    return;
  }
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    const result = await pool.query<{ is_admin: boolean }>(
      "SELECT is_admin FROM customers WHERE customer_id = $1",
      [decoded.customer_id]
    );
    if (!result.rows[0]?.is_admin) {
      res.status(403).json({ error: "Admin yetkisi gerekli" });
      return;
    }
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
};

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders with customer and item details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of orders
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not an admin
 */
// GET /api/admin/orders
router.get("/orders", adminAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.full_name, c.email,
        json_agg(json_build_object(
          'watch_name', w.watch_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        )) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN watches w ON oi.watch_id = w.watch_id
      GROUP BY o.order_id, c.full_name, c.email
      ORDER BY o.order_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
// PUT /api/admin/orders/:id/status
router.put(
  "/orders/:id/status",
  adminAuth,
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    try {
      const result = await pool.query(
        "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
        [status, req.params.id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Sipariş bulunamadı" });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

/**
 * @swagger
 * /admin/watches:
 *   get:
 *     summary: Get all watches (admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of watches ordered by name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Watch'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 */
// GET /api/admin/watches?page=1&limit=50&search=casio&brand=Seiko
router.get("/watches", adminAuth, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 50));
  const search = ((req.query.search as string) || "").trim();
  const brand = ((req.query.brand as string) || "").trim();
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(LOWER(watch_name) LIKE $${idx} OR LOWER(model_code) LIKE $${idx} OR LOWER(brand) LIKE $${idx})`
    );
    params.push(`%${search.toLowerCase()}%`);
    idx++;
  }
  if (brand) {
    conditions.push(`brand = $${idx}`);
    params.push(brand);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM watches ${where} ORDER BY watch_name LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) AS total FROM watches ${where}`, params),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    res.json({
      watches: dataResult.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/admin/watches/:id — update any watch fields (image, description, price, etc.)
router.put(
  "/watches/:id",
  adminAuth,
  validate(updateWatchSchema),
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const fields = req.body as Record<string, unknown>;
    const allowed = [
      "watch_name",
      "brand",
      "model_code",
      "price",
      "stock_quantity",
      "image_url",
      "description",
      "category",
    ];
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    for (const key of allowed) {
      if (key in fields && fields[key] !== undefined) {
        setClauses.push(`${key} = $${i++}`);
        values.push(fields[key] === "" ? null : fields[key]);
      }
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE watches SET ${setClauses.join(", ")} WHERE watch_id = $${i} RETURNING *`,
        values
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Watch not found" });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// POST /api/admin/watches — create new watch
router.post(
  "/watches",
  adminAuth,
  validate(createWatchSchema),
  async (req: Request, res: Response) => {
    const { brand, watch_name, model_code, price, stock_quantity, image_url, description } =
      req.body as {
        brand: string;
        watch_name: string;
        model_code?: string;
        price: number;
        stock_quantity: number;
        image_url?: string;
        description?: string;
      };
    try {
      const result = await pool.query(
        `INSERT INTO watches (brand, watch_name, model_code, price, stock_quantity, image_url, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          brand,
          watch_name,
          model_code || null,
          price,
          stock_quantity ?? 0,
          image_url || null,
          description || null,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

/**
 * @swagger
 * /admin/watches/{id}/stock:
 *   put:
 *     summary: Update watch stock quantity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stock_quantity]
 *             properties:
 *               stock_quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Updated watch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Watch'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Watch not found
 */
// PUT /api/admin/watches/:id/stock
router.put(
  "/watches/:id/stock",
  adminAuth,
  validate(updateStockSchema),
  async (req: Request, res: Response) => {
    const { stock_quantity } = req.body as { stock_quantity: number };
    try {
      const result = await pool.query(
        "UPDATE watches SET stock_quantity = $1 WHERE watch_id = $2 RETURNING *",
        [stock_quantity, req.params.id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Saat bulunamadı" });
        return;
      }
      const watch = result.rows[0] as {
        watch_id: number;
        watch_name: string;
        brand: string;
        stock_quantity: number;
      };

      // Fire low-stock alert if stock drops below 5
      if (watch.stock_quantity < 5) {
        tasks
          .trigger("low-stock-alert", {
            watchId: watch.watch_id,
            watchName: watch.watch_name,
            brand: watch.brand,
            stockQuantity: watch.stock_quantity,
          })
          .catch((e) => console.error("low-stock-alert trigger failed:", e));
      }

      res.json(watch);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats for orders, customers, revenue, and watches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: object
 *                   properties:
 *                     total: { type: string }
 *                     pending: { type: string }
 *                 customers:
 *                   type: object
 *                   properties:
 *                     total: { type: string }
 *                 revenue:
 *                   type: object
 *                   properties:
 *                     total: { type: string }
 *                 watches:
 *                   type: object
 *                   properties:
 *                     total: { type: string }
 *                     low_stock: { type: string }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not an admin
 */
// GET /api/admin/stats
router.get("/stats", adminAuth, async (_req: Request, res: Response) => {
  try {
    const [orders, customers, revenue, watches] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM orders"
      ),
      pool.query("SELECT COUNT(*) as total FROM customers"),
      pool.query(
        "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'"
      ),
      pool.query(
        "SELECT COUNT(*) as total, COUNT(CASE WHEN stock_quantity < 3 THEN 1 END) as low_stock FROM watches"
      ),
    ]);
    res.json({
      orders: orders.rows[0],
      customers: customers.rows[0],
      revenue: revenue.rows[0],
      watches: watches.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
