import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      if (paymentIntent.status === "succeeded") {
        // Confirm order on backend
        const res = await fetch("/api/stripe/confirm-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            order_id: orderId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Payment successful! 🎉");
          onSuccess(orderId);
        }
      }
    } catch (err) {
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
          "Pay Now 💳"
        )}
      </button>
    </form>
  );
}

const Checkout = ({ cart, onOrderSuccess }) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState("confirm"); // confirm | payment | success
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!token) navigate("/login");
    if (cart.length === 0) navigate("/");
  }, []);

  const createOrder = async () => {
    setLoading(true);
    try {
      // Create order in DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            watch_id: item.watch_id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);
      setOrderId(orderData.order_id);

      // Create payment intent
      const payRes = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ amount: total, order_id: orderData.order_id }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);
      setClientSecret(payData.clientSecret);
      setStep("payment");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (oid) => {
    setStep("success");
    onOrderSuccess && onOrderSuccess();
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3 className="fw-bold mb-4">💳 Checkout</h3>

      {/* Step: Confirm Order */}
      {step === "confirm" && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Order Summary</h5>
          {cart.map((item) => (
            <div key={item.watch_id} className="d-flex justify-content-between py-2 border-bottom">
              <span>{item.watch_name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-dark w-100 rounded-pill mt-4"
            onClick={createOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment →"}
          </button>
        </div>
      )}

      {/* Step: Payment */}
      {step === "payment" && clientSecret && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Payment Details</h5>
          <div className="alert alert-info small mb-3">
            🔒 Your payment is secured by Stripe. We never store your card details.
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm orderId={orderId} onSuccess={handleSuccess} />
          </Elements>
        </div>
      )}

      {/* Step: Success */}
      {step === "success" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
          <div style={{ fontSize: 64 }}>🎉</div>
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
