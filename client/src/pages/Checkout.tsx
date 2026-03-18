import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { CartItem, PizzaCartItem } from "../types";
import { apiUrl } from "../config";
import { IS_PIZZA } from "../config/branding";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface CheckoutFormProps {
  orderId: number;
  onSuccess: (orderId: number) => void;
}

function CheckoutForm({ orderId, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        toast.error(error.message ?? "Payment error");
        setLoading(false);
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        const res = await fetch(apiUrl("/api/v1/stripe/confirm-order"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ payment_intent_id: paymentIntent.id, order_id: orderId }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Payment successful!");
          onSuccess(orderId);
        }
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-dark w-100 rounded-pill mt-4"
        style={{ padding: "12px" }}
      >
        {loading ? (
          <span><span className="spinner-border spinner-border-sm me-2" />Processing...</span>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}

interface CheckoutProps {
  cart: CartItem[];
  pizzaCart?: PizzaCartItem[];
  onOrderSuccess: () => void;
}

const Checkout = ({ cart, pizzaCart = [], onOrderSuccess }: CheckoutProps) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<"confirm" | "payment" | "success">("confirm");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const activeItems = IS_PIZZA ? pizzaCart : cart;
  const total = IS_PIZZA
    ? pizzaCart.reduce((sum, item) => sum + Number(item.base_price) * item.quantity, 0)
    : cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  useEffect(() => {
    if (!token) navigate("/login");
    if (activeItems.length === 0) navigate("/");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch(apiUrl(IS_PIZZA ? "/api/v1/pizza/orders" : "/api/v1/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(
          IS_PIZZA
            ? {
                items: pizzaCart.map((item) => ({
                  pizza_id: item.pizza_id,
                  quantity: item.quantity,
                  unit_price: item.base_price,
                  options: item.options,
                })),
              }
            : {
                items: cart.map((item) => ({
                  watch_id: item.watch_id,
                  quantity: item.quantity,
                  unit_price: item.price,
                })),
              }
        ),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      setOrderId(orderData.order_id);

      const payRes = await fetch(apiUrl("/api/v1/stripe/create-payment-intent"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ amount: total, order_id: orderData.order_id }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);
      setClientSecret(payData.clientSecret);
      setStep("payment");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setStep("success");
    onOrderSuccess?.();
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3 className="fw-bold mb-4">{IS_PIZZA ? "Restaurant Checkout" : "Checkout"}</h3>

      {step === "confirm" && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Order Summary</h5>
          {IS_PIZZA
            ? pizzaCart.map((item) => (
                <div key={item.cart_item_id} className="d-flex justify-content-between py-2 border-bottom">
                  <span>
                    {item.name} x{item.quantity}
                    {item.options.side ? ` · ${item.options.side}` : ""}
                    {item.options.sauces?.length ? ` · ${item.options.sauces.join(", ")}` : ""}
                    {item.options.drink ? ` · ${item.options.drink}` : ""}
                  </span>
                  <span>€{(Number(item.base_price) * item.quantity).toFixed(2)}</span>
                </div>
              ))
            : cart.map((item) => (
                <div key={item.watch_id} className="d-flex justify-content-between py-2 border-bottom">
                  <span>{item.watch_name} x{item.quantity}</span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
          <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
            <span>Total</span>
            <span>{IS_PIZZA ? "€" : "$"}{total.toFixed(2)}</span>
          </div>
          <button className="btn btn-dark w-100 rounded-pill mt-4" onClick={createOrder} disabled={loading}>
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      )}

      {step === "payment" && clientSecret && orderId !== null && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Payment Details</h5>
          <div className="alert alert-info small mb-3">
            Your payment is secured by Stripe. We never store your card details.
          </div>
          {!stripePromise ? (
            <div className="alert alert-danger mb-0">
              Stripe is not configured. Missing REACT_APP_STRIPE_PUBLISHABLE_KEY.
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm orderId={orderId} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      )}

      {step === "success" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
          <div style={{ fontSize: 64 }}>Done</div>
          <h4 className="fw-bold mt-3">Payment Successful!</h4>
          <p className="text-muted">Order #{orderId} has been placed successfully.</p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <button className="btn btn-dark rounded-pill" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
            <button className="btn btn-outline-dark rounded-pill" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
