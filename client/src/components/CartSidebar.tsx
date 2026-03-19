import React from "react";
import toast from "react-hot-toast";
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
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error(IS_PIZZA ? "Bitte melde dich vor der Bestellung an" : "Please login to checkout");
      navigate("/login");
      onClose();
      return;
    }
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
            background: "rgba(0,0,0,0.5)",
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
          background: "#fff",
          zIndex: 1050,
          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">{IS_PIZZA ? "Warenkorb" : "Cart"} ({totalCount})</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>x</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {!IS_PIZZA ? (
            <>
              {cart.length === 0 ? <p className="text-muted text-center mt-4">Your cart is empty</p> : null}
              {cart.map((item) => (
                <div key={item.watch_id} className="d-flex align-items-center gap-2 mb-3 p-2 border rounded">
                  <img
                    src={item.image_url}
                    alt={item.watch_name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/60"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.watch_name}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>${item.price}</div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={() => updateQuantity(item.watch_id, item.quantity - 1)}>-</button>
                      <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={() => updateQuantity(item.watch_id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>${(Number(item.price) * item.quantity).toFixed(2)}</div>
                    <button className="btn btn-sm btn-link text-danger p-0 mt-1" onClick={() => removeFromCart(item.watch_id)}>Remove</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {pizzaCart.length === 0 ? <p className="text-muted text-center mt-4">Dein Warenkorb ist leer</p> : null}
              {pizzaCart.map((item) => (
                <div key={item.cart_item_id} className="d-flex align-items-center gap-2 mb-3 p-2 border rounded">
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=60"}
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#e67e22", lineHeight: 1.5 }}>
                      {item.options.side ? `Beilage: ${item.options.side} · ` : ""}
                      {item.options.sauces?.length ? `Soßen: ${item.options.sauces.join(", ")} · ` : ""}
                      {item.options.drink ? `Getränk: ${item.options.drink}` : "Ohne Getränk"}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>€{Number(item.base_price).toFixed(2)}</div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={() => updatePizzaQuantity?.(item.cart_item_id, item.quantity - 1)}>-</button>
                      <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                      <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={() => updatePizzaQuantity?.(item.cart_item_id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>€{(Number(item.base_price) * item.quantity).toFixed(2)}</div>
                    <button className="btn btn-sm btn-link text-danger p-0 mt-1" onClick={() => removePizzaFromCart?.(item.cart_item_id)}>Entfernen</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {activeCart.length > 0 ? (
          <div className="p-3 border-top">
            <div className="d-flex justify-content-between mb-3">
              <strong>{IS_PIZZA ? "Gesamt:" : "Total:"}</strong>
              <strong>{IS_PIZZA ? "€" : "$"}{total.toFixed(2)}</strong>
            </div>
            <button
              className="btn w-100 rounded-pill"
              style={{ background: IS_PIZZA ? "#c0392b" : "#1a1a2e", color: "#fff" }}
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
