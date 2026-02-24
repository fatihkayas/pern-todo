const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const validate = require("../middleware/validate");
const { updateOrderStatusSchema, updateStockSchema } = require("../schemas");

const JWT_SECRET = process.env.JWT_SECRET || "seiko_secret_key_change_in_prod";

// Admin middleware
const adminAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token gerekli" });
  }
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT is_admin FROM customers WHERE customer_id = $1",
      [decoded.customer_id]
    );
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: "Admin yetkisi gerekli" });
    }
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
};

// GET /api/admin/orders - Tüm siparişler
router.get("/orders", adminAuth, async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/orders/:id/status - Sipariş durumu güncelle
router.put("/orders/:id/status", adminAuth, validate(updateOrderStatusSchema), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Sipariş bulunamadı" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/watches - Tüm saatler ve stok
router.get("/watches", adminAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watches ORDER BY watch_name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/watches/:id/stock - Stok güncelle
router.put("/watches/:id/stock", adminAuth, validate(updateStockSchema), async (req, res) => {
  const { stock_quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE watches SET stock_quantity = $1 WHERE watch_id = $2 RETURNING *",
      [stock_quantity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Saat bulunamadı" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats - Dashboard istatistikleri
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [orders, customers, revenue, watches] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM orders"),
      pool.query("SELECT COUNT(*) as total FROM customers"),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'"),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN stock_quantity < 3 THEN 1 END) as low_stock FROM watches"),
    ]);
    res.json({
      orders: orders.rows[0],
      customers: customers.rows[0],
      revenue: revenue.rows[0],
      watches: watches.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;