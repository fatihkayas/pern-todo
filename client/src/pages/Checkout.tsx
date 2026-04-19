import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { CartItem } from "../types";
import { apiUrl } from "../config";
import { fetchWithAuth, getAccessToken } from "../utils/auth";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (error: unknown) => void;
        onCancel?: () => void;
        style?: Record<string, string>;
      }) => { render: (selector: string) => Promise<void> };
    };
  }
}

type PaymentMethod = "stripe" | "paypal";

interface ApiErrorResponse {
  error?: string;
}

interface StripeIntentResponse extends ApiErrorResponse {
  clientSecret?: string;
}

interface OrderResponse extends ApiErrorResponse {
  order_id?: number;
}

interface PayPalCreateOrderResponse extends ApiErrorResponse {
  orderId?: string;
}

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const paypalEnabled = Boolean(paypalClientId);

const getErrorMessage = (message: string, fallback: string) => message.trim() || fallback;

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
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message || "Your card payment could not be completed.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Your payment was not completed. Please try again.");
      }

      const response = await fetchWithAuth(apiUrl("/api/v1/stripe/confirm-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_intent_id: paymentIntent.id, order_id: orderId }),
      });
      const data = (await response.json()) as ApiErrorResponse & { success?: boolean };

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Your payment was captured, but the order confirmation failed.");
      }

      toast.success("Payment successful!");
      onSuccess(orderId);
    } catch (err) {
      toast.error((err as Error).message || "Your payment could not be completed.");
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
          <span>
            <span className="spinner-border spinner-border-sm me-2" />
            Processing payment...
          </span>
        ) : (
          "Pay with Card"
        )}
      </button>
    </form>
  );
}

interface PayPalButtonsProps {
  orderId: number;
  total: number;
  onSuccess: (orderId: number) => void;
}

function PayPalButtons({ orderId, total, onSuccess }: PayPalButtonsProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paypalClientId) {
      setLoading(false);
      return;
    }

    const scriptId = "paypal-sdk";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onLoad = () => {
      setSdkReady(true);
      setLoading(false);
    };

    if (window.paypal) {
      onLoad();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", onLoad);
      return () => existingScript.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = onLoad;
    script.onerror = () => {
      setLoading(false);
      toast.error("PayPal could not be loaded. Please try again or use card payment.");
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal) {
      return;
    }

    const container = document.getElementById("paypal-buttons-container");
    if (!container) {
      return;
    }

    container.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          shape: "pill",
          label: "paypal",
        },
        createOrder: async () => {
          const response = await fetchWithAuth(apiUrl("/api/v1/paypal/create-order"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total, order_id: orderId, currency: "usd" }),
          });
          const data = (await response.json()) as PayPalCreateOrderResponse;

          if (!response.ok || !data.orderId) {
            throw new Error(data.error || "PayPal could not start this checkout session.");
          }

          return data.orderId;
        },
        onApprove: async (data) => {
          const response = await fetchWithAuth(apiUrl("/api/v1/paypal/capture-order"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paypal_order_id: data.orderID, order_id: orderId }),
          });
          const captureData = (await response.json()) as ApiErrorResponse & { success?: boolean };

          if (!response.ok || !captureData.success) {
            throw new Error(captureData.error || "PayPal approved the payment, but capture failed.");
          }

          toast.success("PayPal payment successful!");
          onSuccess(orderId);
        },
        onCancel: () => {
          toast("PayPal checkout was cancelled.");
        },
        onError: () => {
          toast.error("PayPal payment failed. Please try again or choose card payment.");
        },
      })
      .render("#paypal-buttons-container")
      .catch(() => {
        toast.error("PayPal buttons could not be rendered.");
      });
  }, [sdkReady, orderId, total, onSuccess]);

  if (!paypalClientId) {
    return null;
  }

  if (loading) {
    return <div className="text-muted small">Loading PayPal...</div>;
  }

  return <div id="paypal-buttons-container" />;
}

interface CheckoutProps {
  cart: CartItem[];
  onOrderSuccess: () => void;
}

const Checkout = ({ cart, onOrderSuccess }: CheckoutProps) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<"confirm" | "payment" | "success">("confirm");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [preparingStripe, setPreparingStripe] = useState(false);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart.length, navigate]);

  useEffect(() => {
    if (!paypalEnabled && paymentMethod === "paypal") {
      setPaymentMethod("stripe");
    }
  }, [paymentMethod]);

  const prepareStripePayment = async (nextOrderId: number) => {
    if (clientSecret) {
      return clientSecret;
    }

    setPreparingStripe(true);
    try {
      const response = await fetchWithAuth(apiUrl("/api/v1/stripe/create-payment-intent"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, order_id: nextOrderId }),
      });
      const data = (await response.json()) as StripeIntentResponse;

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Card payment is not available for this order yet.");
      }

      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } finally {
      setPreparingStripe(false);
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderResponse = await fetchWithAuth(apiUrl("/api/v1/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            watch_id: item.watch_id,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      });
      const orderData = (await orderResponse.json()) as OrderResponse;

      if (!orderResponse.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Your order could not be created.");
      }

      const nextOrderId = orderData.order_id;
      setOrderId(nextOrderId);
      setClientSecret("");

      if (paymentMethod === "stripe") {
        await prepareStripePayment(nextOrderId);
      }

      setStep("payment");
    } catch (err) {
      toast.error((err as Error).message || "Checkout could not be started.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = async (nextMethod: PaymentMethod) => {
    if (nextMethod === paymentMethod) {
      return;
    }

    setPaymentMethod(nextMethod);

    if (step === "payment" && orderId !== null && nextMethod === "stripe" && !clientSecret) {
      try {
        await prepareStripePayment(orderId);
      } catch (err) {
        setPaymentMethod(paypalEnabled ? "paypal" : "stripe");
        toast.error(
          getErrorMessage(
            (err as Error).message || "",
            "Card payment could not be prepared. Please try again."
          )
        );
      }
    }
  };

  const handleSuccess = (_completedOrderId: number) => {
    setStep("success");
    onOrderSuccess();
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3 className="fw-bold mb-4">Checkout</h3>

      {step === "confirm" && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Order Summary</h5>
          {cart.map((item) => (
            <div key={item.watch_id} className="d-flex justify-content-between py-2 border-bottom">
              <span>
                {item.watch_name} x{item.quantity}
              </span>
              <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="mt-4">
            <label className="form-label fw-semibold">Choose payment method</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn rounded-pill flex-fill ${
                  paymentMethod === "stripe" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => void handlePaymentMethodChange("stripe")}
              >
                Card
              </button>
              {paypalEnabled && (
                <button
                  type="button"
                  className={`btn rounded-pill flex-fill ${
                    paymentMethod === "paypal" ? "btn-dark" : "btn-outline-dark"
                  }`}
                  onClick={() => void handlePaymentMethodChange("paypal")}
                >
                  PayPal
                </button>
              )}
            </div>
          </div>

          {!paypalEnabled && (
            <div className="alert alert-secondary small mt-3 mb-0">
              PayPal is unavailable in this environment.
            </div>
          )}

          <button className="btn btn-dark w-100 rounded-pill mt-4" onClick={createOrder} disabled={loading}>
            {loading ? "Starting checkout..." : "Proceed to Payment"}
          </button>
        </div>
      )}

      {step === "payment" && orderId !== null && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h5 className="fw-bold mb-3">Payment Details</h5>
          <div className="alert alert-info small mb-3">
            Choose your preferred secure payment method below.
          </div>

          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn rounded-pill flex-fill ${
                paymentMethod === "stripe" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => void handlePaymentMethodChange("stripe")}
              disabled={preparingStripe}
            >
              Card
            </button>
            {paypalEnabled && (
              <button
                type="button"
                className={`btn rounded-pill flex-fill ${
                  paymentMethod === "paypal" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => void handlePaymentMethodChange("paypal")}
                disabled={preparingStripe}
              >
                PayPal
              </button>
            )}
          </div>

          {paymentMethod === "stripe" ? (
            preparingStripe ? (
              <div className="text-muted small">Preparing secure card payment...</div>
            ) : !clientSecret ? (
              <div className="alert alert-danger mb-0">
                Card payment could not be prepared. Try switching methods or restarting checkout.
              </div>
            ) : !stripePromise ? (
              <div className="alert alert-danger mb-0">
                Stripe is not configured. Missing REACT_APP_STRIPE_PUBLISHABLE_KEY.
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm orderId={orderId} onSuccess={handleSuccess} />
              </Elements>
            )
          ) : (
            <PayPalButtons orderId={orderId} total={total} onSuccess={handleSuccess} />
          )}
        </div>
      )}

      {step === "success" && (
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
          <div style={{ fontSize: 64 }}>Order Complete</div>
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
