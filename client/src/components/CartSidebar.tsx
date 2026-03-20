import React from "react";
import { useNavigate } from "react-router-dom";
import { CartItem, PizzaCartItem } from "../types";
import { IS_PIZZA } from "../config/branding";

interface CartSidebarProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  removeFromCart: (watch_id: number) => void;
  updateQuantity: (watch_id: number, quantity: number) => void;
  onOrderSuccess: () => void;
  pizzaCart?: PizzaCartItem[];
  removePizzaFromCart?: (cart_item_id: string) => void;
  updatePizzaQuantity?: (cart_item_id: string, quantity: number) => void;
}

const ranchPalette = {
  background: "#F5EFE6",
  section: "#EFE3D3",
  card: "#FFFFFF",
  border: "#E5D6C2",
  text: "#2A1F18",
  secondaryText: "#5C4A3E",
  muted: "#8A7A6A",
  leather: "#8B5E3C",
  gold: "#C1863B",
};

function CartSidebar({
  cart,
  isOpen,
  onClose,
  removeFromCart,
  updateQuantity,
  pizzaCart = [],
  removePizzaFromCart,
  updatePizzaQuantity,
}: CartSidebarProps) {
  const navigate = useNavigate();

  const activeCart = IS_PIZZA ? pizzaCart : cart;
  const totalCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);
  const total = IS_PIZZA
    ? pizzaCart.reduce((sum, item) => sum + Number(item.base_price) * item.quantity, 0)
    : cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const handleCheckout = () => {
    if (activeCart.length === 0) return;
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {isOpen ? (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(42,31,24,0.24)",
            zIndex: 1040,
          }}
        />
      ) : null}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "380px",
          maxWidth: "100%",
          background: IS_PIZZA ? ranchPalette.card : "#fff",
          zIndex: 1050,
          boxShadow: "-10px 0 30px rgba(42,31,24,0.12)",
          borderLeft: IS_PIZZA ? `1px solid ${ranchPalette.border}` : undefined,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center p-3 border-bottom"
          style={IS_PIZZA ? { background: ranchPalette.background, borderColor: ranchPalette.border } : undefined}
        >
          <h5 className="mb-0" style={IS_PIZZA ? { color: ranchPalette.text } : undefined}>
            {IS_PIZZA ? "Warenkorb" : "Cart"} ({totalCount})
          </h5>
          <button
            className="btn btn-sm"
            onClick={onClose}
            style={
              IS_PIZZA
                ? {
                    border: `1px solid ${ranchPalette.border}`,
                    color: ranchPalette.text,
                    background: ranchPalette.card,
                  }
                : undefined
            }
          >
            x
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            background: IS_PIZZA ? ranchPalette.background : undefined,
          }}
        >
          {!IS_PIZZA ? (
            <>
              {cart.length === 0 ? <p className="text-muted text-center mt-4">Your cart is empty</p> : null}
              {cart.map((item) => (
                <div key={item.watch_id} className="d-flex align-items-center gap-2 mb-3 p-2 border rounded">
                  <img
                    src={item.image_url}
                    alt={item.watch_name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/60";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.watch_name}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>${item.price}</div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button
                        className="btn btn-sm btn-outline-secondary px-2 py-0"
                        onClick={() => updateQuantity(item.watch_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary px-2 py-0"
                        onClick={() => updateQuantity(item.watch_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>${(Number(item.price) * item.quantity).toFixed(2)}</div>
                    <button
                      className="btn btn-sm btn-link text-danger p-0 mt-1"
                      onClick={() => removeFromCart(item.watch_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {pizzaCart.length === 0 ? (
                <p className="text-center mt-4" style={{ color: ranchPalette.muted }}>
                  Dein Warenkorb ist leer
                </p>
              ) : null}
              {pizzaCart.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="d-flex align-items-center gap-2 mb-3 p-3 rounded"
                  style={{
                    background: ranchPalette.card,
                    border: `1px solid ${ranchPalette.border}`,
                    boxShadow: "0 8px 20px rgba(42,31,24,0.06)",
                  }}
                >
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=60"}
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 10 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ranchPalette.text }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: ranchPalette.secondaryText, lineHeight: 1.6 }}>
                      {item.options.side ? `Beilage: ${item.options.side} · ` : ""}
                      {item.options.extra ? `Extra: ${item.options.extra} · ` : ""}
                      {item.options.sauces?.length ? `Sossen: ${item.options.sauces.join(", ")} · ` : ""}
                      {item.options.drink ? `Getraenk: ${item.options.drink}` : "Ohne Getraenk"}
                    </div>
                    <div style={{ fontSize: 13, color: ranchPalette.gold, fontWeight: 700 }}>
                      EUR {Number(item.base_price).toFixed(2)}
                    </div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button
                        className="btn btn-sm px-2 py-0"
                        style={{ border: `1px solid ${ranchPalette.border}`, color: ranchPalette.text }}
                        onClick={() => updatePizzaQuantity?.(item.cart_item_id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ minWidth: 24, textAlign: "center", color: ranchPalette.text }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-sm px-2 py-0"
                        style={{ border: `1px solid ${ranchPalette.border}`, color: ranchPalette.text }}
                        onClick={() => updatePizzaQuantity?.(item.cart_item_id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: ranchPalette.text }}>
                      EUR {(Number(item.base_price) * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="btn btn-sm btn-link p-0 mt-1"
                      style={{ color: ranchPalette.leather }}
                      onClick={() => removePizzaFromCart?.(item.cart_item_id)}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {activeCart.length > 0 ? (
          <div
            className="p-3 border-top"
            style={IS_PIZZA ? { background: ranchPalette.card, borderColor: ranchPalette.border } : undefined}
          >
            <div className="d-flex justify-content-between mb-3">
              <strong style={IS_PIZZA ? { color: ranchPalette.text } : undefined}>
                {IS_PIZZA ? "Gesamt:" : "Total:"}
              </strong>
              <strong style={IS_PIZZA ? { color: ranchPalette.text } : undefined}>
                {IS_PIZZA ? "EUR " : "$"}
                {total.toFixed(2)}
              </strong>
            </div>
            <button
              className="btn w-100 rounded-pill"
              style={{
                background: IS_PIZZA ? ranchPalette.leather : "#1a1a2e",
                color: "#fff",
                boxShadow: IS_PIZZA ? "0 12px 26px rgba(139,94,60,0.18)" : undefined,
              }}
              onClick={handleCheckout}
            >
              {IS_PIZZA ? "Zur Kasse" : "Proceed to Checkout"}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default CartSidebar;
