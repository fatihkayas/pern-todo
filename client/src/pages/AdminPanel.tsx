import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Watch, Order, OrderStatus, AdminStats } from "../types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, watchesRes] = await Promise.all([
        fetch("/api/v1/admin/stats", { headers: authHeaders }),
        fetch("/api/v1/admin/orders", { headers: authHeaders }),
        fetch("/api/v1/admin/watches", { headers: authHeaders }),
      ]);
      if (statsRes.status === 403) { toast.error("Admin yetkisi yok"); navigate("/"); return; }
      setStats(await statsRes.json());
      setOrders(await ordersRes.json());
      setWatches(await watchesRes.json());
    } catch (_err) {
      toast.error("Veri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: "PUT", headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, status } : o));
      toast.success("Sipariş durumu güncellendi");
    } catch {
      toast.error("Güncelleme hatası");
    }
  };

  const updateStock = async (watchId: number, stockQuantity: number) => {
    try {
      const res = await fetch(`/api/v1/admin/watches/${watchId}/stock`, {
        method: "PUT", headers: authHeaders,
        body: JSON.stringify({ stock_quantity: stockQuantity }),
      });
      if (!res.ok) throw new Error();
      setWatches((prev) => prev.map((w) => w.watch_id === watchId ? { ...w, stock_quantity: stockQuantity } : w));
      toast.success("Stok güncellendi");
    } catch {
      toast.error("Stok güncelleme hatası");
    }
  };

  if (loading) return (
    <div className="text-center mt-5"><div className="spinner-border" /><p className="mt-2">Yükleniyor...</p></div>
  );

  return (
    <div className="container-fluid px-4">
      <h2 className="fw-bold mb-4">🛠️ Admin Paneli</h2>

      <ul className="nav nav-tabs mb-4">
        {(["dashboard", "orders", "inventory"] as const).map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? "active fw-bold" : ""}`} onClick={() => setTab(t)}>
              {t === "dashboard" ? "📊 Dashboard" : t === "orders" ? "📦 Siparişler" : "⌚ Stok"}
            </button>
          </li>
        ))}
      </ul>

      {tab === "dashboard" && stats && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>📦</div>
              <h2 className="fw-bold">{stats.orders.total}</h2>
              <p className="text-muted mb-0">Toplam Sipariş</p>
              <span className="badge bg-warning mt-1">{stats.orders.pending} bekliyor</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>💰</div>
              <h2 className="fw-bold">${parseFloat(stats.revenue.total).toFixed(0)}</h2>
              <p className="text-muted mb-0">Toplam Gelir</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>👥</div>
              <h2 className="fw-bold">{stats.customers.total}</h2>
              <p className="text-muted mb-0">Müşteri</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>⌚</div>
              <h2 className="fw-bold">{stats.watches.total}</h2>
              <p className="text-muted mb-0">Ürün</p>
              {parseInt(stats.watches.low_stock) > 0 && (
                <span className="badge bg-danger mt-1">{stats.watches.low_stock} düşük stok</span>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <table className="table table-hover mb-0 rounded-4 overflow-hidden">
              <thead className="table-dark">
                <tr>
                  <th>#ID</th><th>Müşteri</th><th>Ürünler</th><th>Toplam</th><th>Tarih</th><th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="fw-bold">#{order.order_id}</td>
                    <td>
                      <div>{order.full_name || "Misafir"}</div>
                      <small className="text-muted">{order.email}</small>
                    </td>
                    <td>
                      {order.items?.filter(Boolean).map((item, i) => (
                        <div key={i} style={{ fontSize: 12 }}>{item.watch_name} x{item.quantity}</div>
                      ))}
                    </td>
                    <td className="fw-bold">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td style={{ fontSize: 12 }}>{new Date(order.order_date).toLocaleDateString("tr-TR")}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 bg-${STATUS_COLORS[order.status]} bg-opacity-25`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value as OrderStatus)}
                        style={{ fontSize: 12, minWidth: 120 }}
                      >
                        {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "inventory" && (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Saat</th><th>Model Kodu</th><th>Fiyat</th><th>Stok</th><th>Güncelle</th>
                </tr>
              </thead>
              <tbody>
                {watches.map((watch) => (
                  <WatchStockRow key={watch.watch_id} watch={watch} onUpdate={updateStock} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

interface WatchStockRowProps {
  watch: Watch;
  onUpdate: (watchId: number, stockQuantity: number) => void;
}

function WatchStockRow({ watch, onUpdate }: WatchStockRowProps) {
  const [stock, setStock] = useState<number>(watch.stock_quantity);
  return (
    <tr>
      <td>
        <div className="fw-bold" style={{ fontSize: 13 }}>{watch.watch_name}</div>
        <span className="badge bg-secondary">{watch.brand}</span>
      </td>
      <td style={{ fontSize: 12 }}>{watch.model_code}</td>
      <td>${watch.price}</td>
      <td>
        <span className={`badge ${stock < 3 ? "bg-danger" : "bg-success"}`}>{stock} adet</span>
      </td>
      <td>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 70 }}
            value={stock}
            min={0}
            onChange={(e) => setStock(Number(e.target.value))}
          />
          <button className="btn btn-sm btn-dark" onClick={() => onUpdate(watch.watch_id, stock)}>
            Kaydet
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminPanel;
