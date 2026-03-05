import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Order, OrderStatus } from "../types";
import { apiUrl } from "../config";

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  pending:    { bg: "#FFF8E7", text: "#B45309", dot: "#F59E0B" },
  processing: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  shipped:    { bg: "#F0F9FF", text: "#0369A1", dot: "#0EA5E9" },
  delivered:  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  cancelled:  { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    "Bekliyor",
  processing: "İşleniyor",
  shipped:    "Kargoda",
  delivered:  "Teslim Edildi",
  cancelled:  "İptal",
};

const STATUS_STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const SHIPPING_FEE = 4.99;

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(apiUrl("/api/v1/orders/my"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr);
        if (arr.length > 0) setSelectedOrder(arr[0]);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Siparişler yüklenemedi");
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuyAgain = (order: Order) => {
    order.items?.forEach((item) => {
      if (item?.watch_id) {
        fetch(apiUrl("/api/v1/cart"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ watch_id: item.watch_id, quantity: item.quantity }),
        });
      }
    });
    toast.success("Ürünler sepete eklendi!");
    navigate("/cart");
  };

  const getStepIndex = (status: OrderStatus) => STATUS_STEPS.indexOf(status);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6b7280", fontFamily: "Georgia, serif" }}>Siparişler yükleniyor…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const styles: Record<string, React.CSSProperties> = {
    page: { fontFamily: "'Georgia', 'Times New Roman', serif", background: "#f9f9f7", minHeight: "100vh", padding: "0 0 60px" },
    header: { background: "#1a1a1a", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" },
    backBtn: { color: "#ccc", background: "none", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" },
    layout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, maxWidth: 1100, margin: "0 auto", padding: "32px 20px" },
    sidebar: { paddingRight: 24 },
    sidebarTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 12, paddingLeft: 4 },
    orderCardId: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
    detail: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" },
    detailHeader: { borderBottom: "1px solid #f3f4f6", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    detailOrderNum: { fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 },
    detailDate: { fontSize: 13, color: "#6b7280" },
    actionBtns: { display: "flex", gap: 10 },
    btnDark: { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    btnOutline: { background: "#fff", color: "#1a1a1a", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    section: { padding: "22px 28px", borderBottom: "1px solid #f3f4f6" },
    sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 16 },
    progressBar: { display: "flex", alignItems: "center", gap: 0, marginBottom: 8 },
    stepLabels: { display: "flex", justifyContent: "space-between", marginTop: 6 },
    itemRow: { display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #f9f9f7" },
    itemIcon: { width: 52, height: 52, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
    itemName: { fontWeight: 600, fontSize: 14, color: "#1a1a1a", marginBottom: 3 },
    itemMeta: { fontSize: 12, color: "#6b7280" },
    itemPrice: { marginLeft: "auto", textAlign: "right" },
    itemUnitPrice: { fontSize: 12, color: "#9ca3af", marginBottom: 2 },
    itemTotal: { fontSize: 15, fontWeight: 700, color: "#1a1a1a" },
    summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280", marginBottom: 10 },
    summaryTotal: { display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#1a1a1a", paddingTop: 14, borderTop: "2px solid #1a1a1a", marginTop: 6 },
    shippingGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    shippingLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 },
    shippingValue: { fontSize: 14, color: "#1a1a1a", lineHeight: 1.5 },
    emptyState: { textAlign: "center", padding: "80px 20px" },
  };

  const dynStyles = {
    orderCard: (active: boolean): React.CSSProperties => ({
      background: active ? "#1a1a1a" : "#fff",
      color: active ? "#fff" : "#1a1a1a",
      border: active ? "1px solid #1a1a1a" : "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 10,
      cursor: "pointer",
      transition: "all 0.15s ease",
    }),
    orderCardDate: (active: boolean): React.CSSProperties => ({ fontSize: 11, color: active ? "#ccc" : "#6b7280", marginBottom: 8 }),
    orderCardAmount: (active: boolean): React.CSSProperties => ({ fontSize: 14, fontWeight: 600, color: active ? "#fff" : "#1a1a1a" }),
    stepDot: (filled: boolean, color: string): React.CSSProperties => ({
      width: 14, height: 14, borderRadius: "50%",
      background: filled ? color : "#e5e7eb",
      border: filled ? `2px solid ${color}` : "2px solid #e5e7eb",
      flexShrink: 0,
      transition: "all 0.3s",
    }),
    stepLine: (filled: boolean): React.CSSProperties => ({
      flex: 1, height: 2,
      background: filled ? "#1a1a1a" : "#e5e7eb",
      transition: "background 0.3s",
    }),
    stepLabel: (active: boolean): React.CSSProperties => ({ fontSize: 10, color: active ? "#1a1a1a" : "#9ca3af", fontWeight: active ? 700 : 400, textAlign: "center", flex: 1 }),
    statusPill: (status: OrderStatus): React.CSSProperties => ({
      display: "inline-flex", alignItems: "center", gap: 6,
      background: STATUS_COLORS[status]?.bg || "#f3f4f6",
      color: STATUS_COLORS[status]?.text || "#374151",
      borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600,
    }),
  };

  if (orders.length === 0) return (
    <div style={styles.page}>
      <div style={styles.emptyState}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
        <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Henüz siparişiniz yok</h4>
        <p style={{ color: "#6b7280", marginBottom: 24 }}>İlk siparişinizi vermek için mağazamıza göz atın.</p>
        <button style={styles.btnDark} onClick={() => navigate("/")}>Alışverişe Başla</button>
      </div>
    </div>
  );

  const o = selectedOrder;

  const getExpectedDelivery = (orderDate: string) => {
    const d = new Date(orderDate);
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>⌚ Siparişlerim</span>
        <button style={styles.backBtn} onClick={() => navigate("/")}>← Alışverişe Devam Et</button>
      </div>

      <div style={styles.layout}>
        {/* Sidebar — Order List */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>{orders.length} Sipariş</div>
          {orders.map((order) => {
            const active = selectedOrder?.order_id === order.order_id;
            return (
              <div key={order.order_id} style={dynStyles.orderCard(active)} onClick={() => setSelectedOrder(order)}>
                <div style={styles.orderCardId}>Sipariş #{order.order_id.slice(0, 8).toUpperCase()}</div>
                <div style={dynStyles.orderCardDate(active)}>
                  {new Date(order.order_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={dynStyles.orderCardAmount(active)}>${parseFloat(order.total_amount).toFixed(2)}</div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 10,
                    background: active ? "rgba(255,255,255,0.15)" : STATUS_COLORS[order.status]?.bg,
                    color: active ? "#fff" : STATUS_COLORS[order.status]?.text,
                  }}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {o && (
          <div style={styles.detail}>
            {/* Header */}
            <div style={styles.detailHeader}>
              <div>
                <div style={styles.detailOrderNum}>Sipariş #{o.order_id.slice(0, 8).toUpperCase()}</div>
                <div style={styles.detailDate}>
                  {new Date(o.order_date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  &nbsp;·&nbsp;
                  <span style={dynStyles.statusPill(o.status)}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[o.status]?.dot, display: "inline-block" }} />
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
              </div>
              <div style={styles.actionBtns}>
                {o.status !== "cancelled" && (
                  <button style={styles.btnDark} onClick={() => handleBuyAgain(o)}>🔄 Tekrar Sipariş Ver</button>
                )}
                <button style={styles.btnOutline} onClick={() => window.print()}>🧾 Fatura</button>
              </div>
            </div>

            {/* Progress */}
            {o.status !== "cancelled" && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Sipariş Durumu</div>
                <div style={styles.progressBar}>
                  {STATUS_STEPS.map((step, i) => {
                    const currentIdx = getStepIndex(o.status);
                    const filled = i <= currentIdx;
                    return (
                      <React.Fragment key={step}>
                        <div style={dynStyles.stepDot(filled, STATUS_COLORS[o.status]?.dot || "#22c55e")} />
                        {i < STATUS_STEPS.length - 1 && <div style={dynStyles.stepLine(i < currentIdx)} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div style={styles.stepLabels}>
                  {STATUS_STEPS.map((step) => (
                    <div key={step} style={dynStyles.stepLabel(step === o.status)}>{STATUS_LABELS[step]}</div>
                  ))}
                </div>
                {(o.status === "shipped" || o.status === "processing") && (
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12, marginBottom: 0 }}>
                    📅 Tahmini teslimat: <strong style={{ color: "#1a1a1a" }}>{getExpectedDelivery(o.order_date)}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Shipping Info */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Kargo & Teslimat Bilgisi</div>
              <div style={styles.shippingGrid}>
                <div>
                  <div style={styles.shippingLabel}>Kargo Yöntemi</div>
                  <div style={styles.shippingValue}>Standart Kargo</div>
                </div>
                <div>
                  <div style={styles.shippingLabel}>Teslimat Adresi</div>
                  <div style={styles.shippingValue}>{o.shipping_address || "Adres belirtilmedi"}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>{o.items?.length || 0} Ürün</div>
              {o.items?.filter(Boolean).map((item, i) => (
                <div key={i} style={{ ...styles.itemRow, ...(i === (o.items?.length || 0) - 1 ? { borderBottom: "none" } : {}) }}>
                  <div style={styles.itemIcon}>⌚</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemName}>{item.watch_name}</div>
                    <div style={styles.itemMeta}>Adet: {item.quantity}</div>
                  </div>
                  <div style={styles.itemPrice}>
                    <div style={styles.itemUnitPrice}>${item.unit_price.toFixed(2)} / adet</div>
                    <div style={styles.itemTotal}>${item.subtotal.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ ...styles.section, borderBottom: "none" }}>
              <div style={styles.sectionTitle}>Sipariş Özeti</div>
              <div style={{ maxWidth: 320, marginLeft: "auto" }}>
                <div style={styles.summaryRow}>
                  <span>Ara Toplam</span>
                  <span>${(parseFloat(o.total_amount) - SHIPPING_FEE).toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Kargo</span>
                  <span>${SHIPPING_FEE.toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Vergiler</span>
                  <span>Dahil</span>
                </div>
                <div style={styles.summaryTotal}>
                  <span>Toplam</span>
                  <span>${parseFloat(o.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;