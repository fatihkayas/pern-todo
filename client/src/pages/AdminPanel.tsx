import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Watch, Order, OrderStatus, AdminStats } from "../types";
import { apiUrl } from "../config";
import { fetchWithAuth, getAccessToken } from "../utils/auth";

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, watchesRes] = await Promise.all([
        fetchWithAuth(apiUrl("/api/v1/admin/stats"), {
          headers: { "Content-Type": "application/json" },
        }),
        fetchWithAuth(apiUrl("/api/v1/admin/orders"), {
          headers: { "Content-Type": "application/json" },
        }),
        fetchWithAuth(apiUrl("/api/v1/admin/watches"), {
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (statsRes.status === 403) {
        toast.error("You do not have admin access.");
        navigate("/");
        return;
      }

      if (!statsRes.ok || !ordersRes.ok || !watchesRes.ok) {
        throw new Error("Unable to load admin data.");
      }

      const [statsData, ordersData, watchesData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        watchesRes.json(),
      ]);

      setStats(statsData as AdminStats);
      setOrders(Array.isArray(ordersData) ? (ordersData as Order[]) : []);
      setWatches(Array.isArray(watchesData) ? (watchesData as Watch[]) : []);
    } catch (err) {
      toast.error((err as Error).message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    void loadData();
  }, [loadData, navigate]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetchWithAuth(apiUrl(`/api/v1/admin/orders/${orderId}/status`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Unable to update the order status.");
      }

      setOrders((prev) =>
        prev.map((order) => (order.order_id === orderId ? { ...order, status } : order))
      );
      toast.success("Order status updated.");
    } catch (err) {
      toast.error((err as Error).message || "Unable to update the order status.");
    }
  };

  const updateStock = async (watchId: number, stockQuantity: number) => {
    try {
      const res = await fetchWithAuth(apiUrl(`/api/v1/admin/watches/${watchId}/stock`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_quantity: stockQuantity }),
      });

      if (!res.ok) {
        throw new Error("Unable to update stock.");
      }

      setWatches((prev) =>
        prev.map((watch) =>
          watch.watch_id === watchId ? { ...watch, stock_quantity: stockQuantity } : watch
        )
      );
      toast.success("Stock updated.");
    } catch (err) {
      toast.error((err as Error).message || "Unable to update stock.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <h2 className="fw-bold mb-4">Admin Panel</h2>

      <ul className="nav nav-tabs mb-4">
        {(["dashboard", "orders", "inventory"] as const).map((nextTab) => (
          <li className="nav-item" key={nextTab}>
            <button
              className={`nav-link ${tab === nextTab ? "active fw-bold" : ""}`}
              onClick={() => setTab(nextTab)}
            >
              {nextTab === "dashboard"
                ? "Dashboard"
                : nextTab === "orders"
                  ? "Orders"
                  : "Inventory"}
            </button>
          </li>
        ))}
      </ul>

      {tab === "dashboard" && stats && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>Orders</div>
              <h2 className="fw-bold">{stats.orders.total}</h2>
              <p className="text-muted mb-0">Total Orders</p>
              <span className="badge bg-warning mt-1">{stats.orders.pending} pending</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>Revenue</div>
              <h2 className="fw-bold">${parseFloat(stats.revenue.total).toFixed(0)}</h2>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>Customers</div>
              <h2 className="fw-bold">{stats.customers.total}</h2>
              <p className="text-muted mb-0">Customers</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div style={{ fontSize: 36 }}>Watches</div>
              <h2 className="fw-bold">{stats.watches.total}</h2>
              <p className="text-muted mb-0">Products</p>
              {parseInt(stats.watches.low_stock, 10) > 0 && (
                <span className="badge bg-danger mt-1">{stats.watches.low_stock} low stock</span>
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
                  <th>#ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="fw-bold">#{order.order_id}</td>
                    <td>
                      <div>{order.full_name || "Guest"}</div>
                      <small className="text-muted">{order.email}</small>
                    </td>
                    <td>
                      {order.items?.filter(Boolean).map((item, index) => (
                        <div key={index} style={{ fontSize: 12 }}>
                          {item.watch_name} x{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td style={{ fontSize: 12 }}>
                      {new Date(order.order_date).toLocaleDateString("en-US")}
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm border-0 bg-${STATUS_COLORS[order.status]} bg-opacity-25`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value as OrderStatus)}
                        style={{ fontSize: 12, minWidth: 120 }}
                      >
                        {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
                          (status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          )
                        )}
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
                  <th>Watch</th>
                  <th>Model Code</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Update</th>
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
        <div className="fw-bold" style={{ fontSize: 13 }}>
          {watch.watch_name}
        </div>
        <span className="badge bg-secondary">{watch.brand}</span>
      </td>
      <td style={{ fontSize: 12 }}>{watch.model_code}</td>
      <td>${watch.price}</td>
      <td>
        <span className={`badge ${stock < 3 ? "bg-danger" : "bg-success"}`}>{stock} units</span>
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
            Save
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminPanel;
