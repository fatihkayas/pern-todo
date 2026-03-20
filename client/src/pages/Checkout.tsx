import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { CartItem, PizzaCartItem } from "../types";
import { apiUrl } from "../config";
import { IS_PIZZA } from "../config/branding";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const googleAuthUrl = process.env.REACT_APP_GOOGLE_AUTH_URL || apiUrl("/api/v1/auth/google");

interface CheckoutFormProps {
  orderId: number;
  onSuccess: (orderId: number) => void;
}

interface CheckoutProps {
  cart: CartItem[];
  pizzaCart?: PizzaCartItem[];
  onOrderSuccess: () => void;
}

type CheckoutStep = "details" | "payment" | "success";
type FulfillmentMode = "delivery" | "pickup";

type GuestFormState = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  deliveryNotes: string;
  orderNote: string;
};

type GuestFormErrors = Partial<Record<keyof GuestFormState, string>>;

const ranchPalette = {
  background: "#F5EFE6",
  surface: "#FFFFFF",
  elevated: "#EFE3D3",
  border: "#E5D6C2",
  text: "#2A1F18",
  muted: "#6B5B4D",
  brown: "#8B5E3C",
  yellow: "#C1863B",
  danger: "#ff8d7c",
};

function StripeCheckoutForm({ orderId, onSuccess }: CheckoutFormProps) {
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
        toast.error(error.message ?? "Zahlung fehlgeschlagen");
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const res = await fetch(apiUrl("/api/v1/stripe/confirm-order"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_intent_id: paymentIntent.id, order_id: orderId }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Zahlung erfolgreich!");
          onSuccess(orderId);
        } else {
          toast.error("Bestellung konnte nicht bestätigt werden.");
        }
      }
    } catch {
      toast.error("Zahlung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading} style={styles.primaryAction}>
        {loading ? "Wird verarbeitet..." : "Bestellung abschließen"}
      </button>
    </form>
  );
}

const initialGuestForm: GuestFormState = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  postalCode: "",
  city: "",
  deliveryNotes: "",
  orderNote: "",
};

const Checkout = ({ cart, pizzaCart = [], onOrderSuccess }: CheckoutProps) => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<CheckoutStep>("details");
  const [loading, setLoading] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState(true);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>("delivery");
  const [guestForm, setGuestForm] = useState<GuestFormState>(initialGuestForm);
  const [errors, setErrors] = useState<GuestFormErrors>({});

  const token = localStorage.getItem("token");
  const activeItems = IS_PIZZA ? pizzaCart : cart;
  const total = IS_PIZZA
    ? pizzaCart.reduce((sum, item) => sum + Number(item.base_price) * item.quantity, 0)
    : cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  React.useEffect(() => {
    if (activeItems.length === 0) {
      navigate("/");
    }
  }, [activeItems.length, navigate]);

  const isAuthenticated = Boolean(token);

  const orderSummary = useMemo(
    () =>
      IS_PIZZA
        ? pizzaCart.map((item) => ({
            key: item.cart_item_id,
            name: item.name,
            quantity: item.quantity,
            detail: [
              item.options.side,
              item.options.extra,
              item.options.sauces?.length ? item.options.sauces.join(", ") : undefined,
              item.options.drink,
            ]
              .filter(Boolean)
              .join(" · "),
            price: Number(item.base_price) * item.quantity,
          }))
        : cart.map((item) => ({
            key: String(item.watch_id),
            name: item.watch_name,
            quantity: item.quantity,
            detail: "",
            price: Number(item.price) * item.quantity,
          })),
    [cart, pizzaCart]
  );

  const handleGoogleContinue = () => {
    window.location.href = `${googleAuthUrl}?returnTo=${encodeURIComponent("/checkout")}`;
  };

  const scrollToGuestForm = () => {
    setGuestEnabled(true);
    window.setTimeout(() => {
      document.getElementById("guest-checkout-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const setField = (field: keyof GuestFormState, value: string) => {
    setGuestForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateGuestForm = () => {
    const nextErrors: GuestFormErrors = {};

    if (!guestForm.fullName.trim()) nextErrors.fullName = "Bitte vollständigen Namen eingeben.";
    if (!guestForm.email.trim()) nextErrors.email = "Bitte E-Mail eingeben.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestForm.email.trim())) nextErrors.email = "Bitte gültige E-Mail eingeben.";
    if (!guestForm.phone.trim()) nextErrors.phone = "Bitte Telefonnummer eingeben.";

    if (fulfillmentMode === "delivery") {
      if (!guestForm.street.trim()) nextErrors.street = "Bitte Straße und Hausnummer eingeben.";
      if (!guestForm.postalCode.trim()) nextErrors.postalCode = "Bitte Postleitzahl eingeben.";
      if (!guestForm.city.trim()) nextErrors.city = "Bitte Stadt eingeben.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildAddressPayload = () => {
    const lines =
      fulfillmentMode === "delivery"
        ? [
            `Modus: Lieferung`,
            `Name: ${guestForm.fullName}`,
            `E-Mail: ${guestForm.email}`,
            `Telefon: ${guestForm.phone}`,
            `Adresse: ${guestForm.street}`,
            `PLZ: ${guestForm.postalCode}`,
            `Stadt: ${guestForm.city}`,
            guestForm.deliveryNotes ? `Lieferhinweise: ${guestForm.deliveryNotes}` : "",
          ]
        : [
            `Modus: Abholung`,
            `Name: ${guestForm.fullName}`,
            `E-Mail: ${guestForm.email}`,
            `Telefon: ${guestForm.phone}`,
            guestForm.orderNote ? `Bestellnotiz: ${guestForm.orderNote}` : "",
          ];

    return lines.filter(Boolean).join("\n");
  };

  const createOrder = async () => {
    if (!isAuthenticated) {
      const valid = validateGuestForm();
      if (!valid) {
        toast.error("Bitte prüfe deine Kundendaten.");
        return;
      }
    }

    setLoading(true);

    try {
      const orderRes = await fetch(apiUrl(IS_PIZZA ? "/api/v1/pizza/orders" : "/api/v1/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(
          IS_PIZZA
            ? {
                items: pizzaCart.map((item) => ({
                  pizza_id: item.pizza_id,
                  quantity: item.quantity,
                  unit_price: Number(item.base_price),
                  options: {
                    size: item.options.size || "Standard",
                    toppings: item.options.toppings || [],
                    side: item.options.side,
                    sidePrice: item.options.sidePrice,
                    extra: item.options.extra,
                    extraPrice: item.options.extraPrice,
                    sauces: item.options.sauces,
                    drink: item.options.drink,
                    drinkPrice: item.options.drinkPrice,
                  },
                })),
                delivery_address: isAuthenticated ? "" : buildAddressPayload(),
              }
            : {
                items: cart.map((item) => ({
                  watch_id: item.watch_id,
                  quantity: item.quantity,
                  unit_price: Number(item.price),
                })),
                shipping_address: isAuthenticated ? "" : buildAddressPayload(),
              }
        ),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Bestellung konnte nicht erstellt werden.");
      setOrderId(orderData.order_id);

      const payRes = await fetch(apiUrl("/api/v1/stripe/create-payment-intent"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: total, order_id: orderData.order_id, currency: "eur" }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "Zahlung konnte nicht initialisiert werden.");

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
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerBlock}>
          <div style={styles.kicker}>Ranch Kebab Checkout</div>
          <h1 style={styles.title}>Kasse ohne Zwang zur Registrierung.</h1>
          <p style={styles.subtitle}>
            Melde dich mit Google an oder bestelle einfach als Gast. Dein Checkout bleibt
            reibungslos, touch-freundlich und klar.
          </p>
        </div>

        {step === "details" && (
          <div style={styles.layout}>
            <div style={styles.mainCard}>
              <div style={styles.sectionBlock}>
                <button type="button" style={styles.googleButton} onClick={handleGoogleContinue}>
                  <GoogleIcon />
                  <span>Mit Google anmelden</span>
                </button>
                <div style={styles.dividerRow}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>oder</span>
                  <div style={styles.dividerLine} />
                </div>

                <button
                  type="button"
                  style={{
                    ...styles.guestButton,
                    ...(guestEnabled ? styles.guestButtonActive : {}),
                  }}
                  onClick={scrollToGuestForm}
                >
                  Ohne Konto bestellen
                </button>

                {isAuthenticated ? (
                  <div style={styles.loggedInNotice}>
                    Du bist bereits angemeldet. Kontodaten werden automatisch verwendet, Gast-Checkout bleibt aber weiterhin verfügbar.
                  </div>
                ) : null}
              </div>

              {(guestEnabled || !isAuthenticated) && (
                <div id="guest-checkout-form" style={styles.formBlock}>
                  <div style={styles.toggleRow}>
                    <button
                      type="button"
                      style={{
                        ...styles.fulfillmentChip,
                        ...(fulfillmentMode === "delivery" ? styles.fulfillmentChipActive : {}),
                      }}
                      onClick={() => setFulfillmentMode("delivery")}
                    >
                      Lieferung
                    </button>
                    <button
                      type="button"
                      style={{
                        ...styles.fulfillmentChip,
                        ...(fulfillmentMode === "pickup" ? styles.fulfillmentChipActive : {}),
                      }}
                      onClick={() => setFulfillmentMode("pickup")}
                    >
                      Abholung
                    </button>
                  </div>

                  <SectionTitle title="Kundendaten" subtitle="Ohne Konto bestellen oder als Gast weitermachen." />

                  <div style={styles.formGrid}>
                    <Field
                      label="Vollständiger Name"
                      value={guestForm.fullName}
                      onChange={(value) => setField("fullName", value)}
                      error={errors.fullName}
                    />
                    <Field
                      label="E-Mail"
                      type="email"
                      value={guestForm.email}
                      onChange={(value) => setField("email", value)}
                      error={errors.email}
                    />
                    <Field
                      label="Telefonnummer"
                      value={guestForm.phone}
                      onChange={(value) => setField("phone", value)}
                      error={errors.phone}
                    />
                  </div>

                  {fulfillmentMode === "delivery" ? (
                    <>
                      <SectionTitle title="Lieferadresse" subtitle="Bitte gib die vollständige Adresse für die Zustellung an." />
                      <div style={styles.formGrid}>
                        <Field
                          label="Straße und Hausnummer"
                          value={guestForm.street}
                          onChange={(value) => setField("street", value)}
                          error={errors.street}
                        />
                        <Field
                          label="Postleitzahl"
                          value={guestForm.postalCode}
                          onChange={(value) => setField("postalCode", value)}
                          error={errors.postalCode}
                        />
                        <Field
                          label="Stadt"
                          value={guestForm.city}
                          onChange={(value) => setField("city", value)}
                          error={errors.city}
                        />
                      </div>
                      <TextAreaField
                        label="Liefernotizen"
                        value={guestForm.deliveryNotes}
                        onChange={(value) => setField("deliveryNotes", value)}
                        placeholder="Optional: Klingelhinweise, Stockwerk oder besondere Wünsche"
                      />
                    </>
                  ) : (
                    <TextAreaField
                      label="Bestellnotiz"
                      value={guestForm.orderNote}
                      onChange={(value) => setField("orderNote", value)}
                      placeholder="Optional: Hinweise für die Abholung"
                    />
                  )}
                </div>
              )}

              <button type="button" style={styles.primaryAction} onClick={createOrder} disabled={loading}>
                {loading ? "Wird verarbeitet..." : "Bestellung abschließen"}
              </button>
            </div>

            <aside style={styles.summaryCard}>
              <div style={styles.summaryEyebrow}>Bestellübersicht</div>
              {orderSummary.map((item) => (
                <div key={item.key} style={styles.summaryRow}>
                  <div>
                    <div style={styles.summaryItemName}>
                      {item.name} x{item.quantity}
                    </div>
                    {item.detail ? <div style={styles.summaryItemMeta}>{item.detail}</div> : null}
                  </div>
                  <div style={styles.summaryItemPrice}>{formatEuro(item.price)}</div>
                </div>
              ))}
              <div style={styles.totalRow}>
                <span>Gesamt</span>
                <strong>{formatEuro(total)}</strong>
              </div>
            </aside>
          </div>
        )}

        {step === "payment" && clientSecret && orderId !== null && (
          <div style={styles.paymentCard}>
            <div style={styles.sectionBlock}>
              <SectionTitle title="Zahlungsdetails" subtitle="Stripe verarbeitet deine Zahlung sicher. Ein Konto ist nicht erforderlich." />
              {!stripePromise ? (
                <div style={styles.inlineError}>Stripe ist nicht konfiguriert. Bitte REACT_APP_STRIPE_PUBLISHABLE_KEY prüfen.</div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm orderId={orderId} onSuccess={handleSuccess} />
                </Elements>
              )}
            </div>
          </div>
        )}

        {step === "success" && (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Bestellung erfolgreich angelegt</h2>
            <p style={styles.successText}>
              Deine Bestellung #{orderId} wurde erfolgreich erstellt. Du kannst direkt weiter bestellen oder zur Startseite zurückkehren.
            </p>
            <div style={styles.successActions}>
              {isAuthenticated ? (
                <button type="button" style={styles.secondaryAction} onClick={() => navigate("/orders")}>
                  Meine Bestellungen
                </button>
              ) : null}
              <button type="button" style={styles.primaryAction} onClick={() => navigate("/")}>
                Weiter bestellen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={styles.sectionTitleWrap}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <p style={styles.sectionHint}>{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <label style={styles.fieldWrap}>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
      />
      {error ? <span style={styles.errorText}>{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label style={styles.fieldWrap}>
      <span style={styles.fieldLabel}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{ ...styles.input, ...styles.textArea }}
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.5-5.4 3.5-3.2 0-5.8-2.6-5.8-5.8S8.8 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.7 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.7-3.7 8.7-8.9 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#34A853" d="M3 7.6l3.2 2.3C7 8 9.3 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.7 14.6 3 12 3 8.1 3 4.7 5.2 3 7.6z" />
      <path fill="#FBBC05" d="M12 21c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.3 1.1-3.9 0-5.1-2.3-5.4-3.4l-3.2 2.5C5 18.8 8.2 21 12 21z" />
      <path fill="#4285F4" d="M3 16.5l3.2-2.5c-.2-.5-.3-1-.3-1.6s.1-1.1.3-1.6L3 8.2C2.4 9.4 2 10.7 2 12s.4 2.6 1 4.5z" />
    </svg>
  );
}

function formatEuro(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: ranchPalette.background,
    color: ranchPalette.text,
    padding: "120px 16px 56px",
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  headerBlock: {
    marginBottom: 28,
  },
  kicker: {
    color: ranchPalette.brown,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: "clamp(34px, 6vw, 56px)",
    lineHeight: 1.04,
    fontWeight: 900,
  },
  subtitle: {
    margin: "14px 0 0",
    maxWidth: 740,
    color: ranchPalette.muted,
    lineHeight: 1.8,
    fontSize: 17,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 24,
  },
  mainCard: {
    background: ranchPalette.surface,
    border: `1px solid ${ranchPalette.border}`,
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 38px rgba(42,31,24,0.10)",
  },
  summaryCard: {
    alignSelf: "start",
    position: "sticky",
    top: 116,
    background: ranchPalette.surface,
    border: `1px solid ${ranchPalette.border}`,
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 38px rgba(42,31,24,0.10)",
  },
  paymentCard: {
    background: ranchPalette.surface,
    border: `1px solid ${ranchPalette.border}`,
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 38px rgba(42,31,24,0.10)",
  },
  successCard: {
    background: ranchPalette.surface,
    border: `1px solid ${ranchPalette.border}`,
    borderRadius: 28,
    padding: "40px 24px",
    textAlign: "center",
    boxShadow: "0 18px 38px rgba(42,31,24,0.10)",
  },
  successIcon: {
    width: 72,
    height: 72,
    margin: "0 auto 18px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(242,201,76,0.12)",
    color: ranchPalette.yellow,
    fontSize: 34,
    fontWeight: 900,
  },
  successTitle: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
  },
  successText: {
    margin: "14px auto 0",
    maxWidth: 560,
    color: ranchPalette.muted,
    lineHeight: 1.8,
  },
  successActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 24,
  },
  sectionBlock: {
    display: "grid",
    gap: 16,
  },
  formBlock: {
    display: "grid",
    gap: 18,
    marginTop: 22,
  },
  googleButton: {
    width: "100%",
    minHeight: 58,
    borderRadius: 18,
    border: `1px solid ${ranchPalette.border}`,
    background: "#ffffff",
    color: "#141414",
    fontWeight: 800,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    cursor: "pointer",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    background: ranchPalette.border,
  },
  dividerText: {
    color: ranchPalette.muted,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  guestButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 18,
    border: `1px solid ${ranchPalette.border}`,
    background: ranchPalette.elevated,
    color: ranchPalette.text,
    fontWeight: 800,
    cursor: "pointer",
  },
  guestButtonActive: {
    borderColor: "rgba(242,201,76,0.34)",
    boxShadow: "0 0 0 1px rgba(242,201,76,0.16) inset",
  },
  loggedInNotice: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(193,154,107,0.12)",
    color: ranchPalette.brown,
    lineHeight: 1.6,
  },
  toggleRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  fulfillmentChip: {
    minHeight: 44,
    padding: "0 16px",
    borderRadius: 999,
    border: `1px solid ${ranchPalette.border}`,
    background: ranchPalette.surface,
    color: ranchPalette.text,
    fontWeight: 800,
    cursor: "pointer",
  },
  fulfillmentChipActive: {
    background: ranchPalette.yellow,
    color: "#111111",
    borderColor: ranchPalette.yellow,
  },
  sectionTitleWrap: {
    display: "grid",
    gap: 6,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  sectionHint: {
    margin: 0,
    color: ranchPalette.muted,
    lineHeight: 1.7,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  fieldWrap: {
    display: "grid",
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    minHeight: 54,
    borderRadius: 18,
    border: `1px solid ${ranchPalette.border}`,
    background: ranchPalette.elevated,
    color: ranchPalette.text,
    padding: "0 16px",
    outline: "none",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
    paddingBottom: 14,
    resize: "vertical",
  },
  inputError: {
    borderColor: ranchPalette.danger,
  },
  errorText: {
    color: ranchPalette.danger,
    fontSize: 12,
    lineHeight: 1.5,
  },
  inlineError: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(255,141,124,0.08)",
    color: ranchPalette.danger,
  },
  inlineInfo: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(193,154,107,0.12)",
    color: ranchPalette.brown,
    lineHeight: 1.6,
  },
  summaryEyebrow: {
    color: ranchPalette.brown,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 14,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    padding: "12px 0",
    borderBottom: `1px solid ${ranchPalette.border}`,
  },
  summaryItemName: {
    fontWeight: 700,
    lineHeight: 1.4,
  },
  summaryItemMeta: {
    marginTop: 4,
    color: ranchPalette.muted,
    fontSize: 13,
    lineHeight: 1.5,
  },
  summaryItemPrice: {
    color: ranchPalette.yellow,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    fontSize: 20,
  },
  primaryAction: {
    width: "100%",
    minHeight: 56,
    marginTop: 24,
    borderRadius: 18,
    border: "none",
    background: ranchPalette.yellow,
    color: "#111111",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(242,201,76,0.18)",
  },
  secondaryAction: {
    minHeight: 56,
    padding: "0 20px",
    borderRadius: 18,
    border: `1px solid ${ranchPalette.border}`,
    background: ranchPalette.surface,
    color: ranchPalette.text,
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default Checkout;
