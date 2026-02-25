import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";
import validate from "../middleware/validate";
import { updateOrderStatusSchema, updateStockSchema } from "../schemas";
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
// GET /api/admin/watches
router.get("/watches", adminAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM watches ORDER BY watch_name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

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
      res.json(result.rows[0]);
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
