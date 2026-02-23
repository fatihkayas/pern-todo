import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "warning",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_LABELS = {
  pending: "⏳ Bekliyor",
  processing: "⚙️ İşleniyor",
  shipped: "🚚 Kargoda",
  delivered: "✅ Teslim Edildi",
  cancelled: "❌ İptal",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/orders/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Siparişler yüklenemedi");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border" />
      <p className="mt-2">Yükleniyor...</p>
    </div>
  );

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <h3 className="fw-bold mb-4">📦 Siparişlerim</h3>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 64 }}>📭</div>
          <h5 className="mt-3 text-muted">Henüz siparişiniz yok</h5>
          <button className="btn btn-dark rounded-pill mt-3" onClick={() => navigate("/")}>
            Alışverişe Başla
          </button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold mb-0">Sipariş #{order.order_id}</h6>
                  <small className="text-muted">
                    {new Date(order.order_date).toLocaleDateString("tr-TR", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </small>
                </div>
                <span className={`badge bg-${STATUS_COLORS[order.status]} fs-6`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Items */}
              <div className="border rounded-3 p-3 mb-3 bg-light">
                {order.items?.filter(Boolean).map((item, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-1">
                    <span style={{ fontSize: 14 }}>⌚ {item.watch_name}</span>
                    <span style={{ fontSize: 14 }} className="text-muted">
                      {item.quantity}x ${item.unit_price} = <strong>${item.subtotal}</strong>
                    </span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">
                  {order.shipping_address || "Adres belirtilmedi"}
                </span>
                <span className="fw-bold fs-5">
                  Toplam: ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
