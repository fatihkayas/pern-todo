import React, { useState } from "react";
import toast from "react-hot-toast";

function CartSidebar({ cart, isOpen, onClose, removeFromCart, updateQuantity, onOrderSuccess }) {
  const [loading, setLoading] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
    },
        body: JSON.stringify({
          items: cart.map((item) => ({
            watch_id: item.watch_id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrderDone(data.order_id);
      onOrderSuccess();
      toast.success(`Sipariş #${data.order_id} oluşturuldu! 🎉`);
    } catch (err) {
      toast.error("Sipariş hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, height: "100%", width: "380px",
          background: "#fff", zIndex: 1050, boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">🛒 Sepetim ({cart.reduce((s, i) => s + i.quantity, 0)})</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {orderDone && (
            <div className="alert alert-success">
              ✅ Sipariş #{orderDone} tamamlandı!
              <button className="btn btn-sm btn-success ms-2" onClick={() => { setOrderDone(null); onClose(); }}>
                Kapat
              </button>
            </div>
          )}
          {cart.length === 0 && !orderDone && (
            <p className="text-muted text-center mt-4">Sepetiniz boş</p>
          )}
          {cart.map((item) => (
            <div key={item.watch_id} className="d-flex align-items-center gap-2 mb-3 p-2 border rounded">
              <img
                src={item.image_url}
                alt={item.watch_name}
                style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.watch_name}</div>
                <div style={{ fontSize: 13, color: "#666" }}>${item.price}</div>
                <div className="d-flex align-items-center gap-1 mt-1">
                  <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                    onClick={() => updateQuantity(item.watch_id, item.quantity - 1)}>−</button>
                  <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                    onClick={() => updateQuantity(item.watch_id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                <button className="btn btn-sm btn-link text-danger p-0 mt-1"
                  onClick={() => removeFromCart(item.watch_id)}>Sil</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between mb-3">
              <strong>Toplam:</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button
              className="btn btn-dark w-100"
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Siparişi Tamamla"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;