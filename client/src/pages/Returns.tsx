import React, { useState } from "react";
import toast from "react-hot-toast";

interface ReturnForm {
  orderId: string;
  email: string;
  reason: string;
  details: string;
}

const Returns = () => {
  const [form, setForm] = useState<ReturnForm>({ orderId: "", email: "", reason: "", details: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.email || !form.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
    toast.success("Return request submitted! ✅");
  };

  const steps = [
    { num: "01", title: "Submit Request", desc: "Fill out the return form below with your order details." },
    { num: "02", title: "Get Approved", desc: "We'll review and email you a prepaid return label within 24h." },
    { num: "03", title: "Ship It Back", desc: "Pack the watch in original packaging and drop it at any post office." },
    { num: "04", title: "Get Refunded", desc: "Full refund processed within 5 business days of receiving the watch." },
  ];

  const reasons = [
    "Changed my mind", "Wrong size / fit", "Defective or damaged",
    "Not as described", "Received wrong item", "Other",
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "#d4af37", letterSpacing: "6px", fontSize: "11px", textTransform: "uppercase", marginBottom: "16px" }}>Hassle-Free</p>
        <h1 style={{ color: "#fff", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: "300", marginBottom: "16px" }}>
          Returns & <span style={{ color: "#d4af37", fontStyle: "italic" }}>Refunds</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>
          Not satisfied? We offer free returns within 30 days of purchase. No questions asked.
        </p>
      </div>

      <div style={{ background: "#d4af37", padding: "32px 20px" }}>
        <div className="container">
          <div className="row text-center">
            {[
              { icon: "📅", text: "30-Day Returns" }, { icon: "🚚", text: "Free Return Shipping" },
              { icon: "💳", text: "Full Refund" }, { icon: "⚡", text: "5-Day Processing" },
            ].map((b, i) => (
              <div key={i} className="col-6 col-md-3 mb-2 mb-md-0">
                <span style={{ fontSize: "20px" }}>{b.icon}</span>
                <span style={{ marginLeft: "8px", fontSize: "13px", fontWeight: "600", color: "#0a0a0a" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fafaf8", padding: "80px 20px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#d4af37", letterSpacing: "4px", fontSize: "11px", textTransform: "uppercase", marginBottom: "12px" }}>How It Works</p>
            <h2 style={{ fontSize: "32px", fontWeight: "300", color: "#0a0a0a" }}>4 Simple Steps</h2>
          </div>
          <div className="row">
            {steps.map((s, i) => (
              <div key={i} className="col-md-3 mb-4 text-center">
                <div style={{ background: "#fff", borderRadius: "4px", padding: "40px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", height: "100%" }}>
                  <div style={{ fontSize: "36px", fontWeight: "700", color: "#d4af37", marginBottom: "16px" }}>{s.num}</div>
                  <h5 style={{ color: "#0a0a0a", fontWeight: "600", marginBottom: "12px" }}>{s.title}</h5>
                  <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#0a0a0a", padding: "80px 20px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              {submitted ? (
                <div style={{ textAlign: "center", padding: "60px 40px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "4px" }}>
                  <div style={{ fontSize: "64px", marginBottom: "24px" }}>✅</div>
                  <h3 style={{ color: "#d4af37", fontWeight: "300", marginBottom: "16px" }}>Request Submitted!</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: "1.8" }}>
                    We've received your return request for order <strong style={{ color: "#fff" }}>#{form.orderId}</strong>.
                    Check your email at <strong style={{ color: "#fff" }}>{form.email}</strong> for the prepaid return label within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ orderId: "", email: "", reason: "", details: "" }); }}
                    style={{ marginTop: "24px", background: "#d4af37", color: "#0a0a0a", border: "none", padding: "12px 32px", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}
                  >
                    New Request
                  </button>
                </div>
              ) : (
                <div style={{ border: "1px solid rgba(212,175,55,0.2)", borderRadius: "4px", padding: "48px" }}>
                  <h2 style={{ color: "#fff", fontSize: "28px", fontWeight: "300", marginBottom: "32px", textAlign: "center" }}>
                    Start a Return
                  </h2>

                  {(["orderId", "email"] as const).map((field) => (
                    <div key={field} className="mb-4">
                      <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>
                        {field === "orderId" ? "Order ID *" : "Email Address *"}
                      </label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        placeholder={field === "orderId" ? "e.g. ORD-12345" : "Email used at purchase"}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "Georgia, serif" }}
                        onFocus={(e) => (e.target.style.borderColor = "#d4af37")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  ))}

                  <div className="mb-4">
                    <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>Reason *</label>
                    <select
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", color: form.reason ? "#fff" : "#888", outline: "none", fontFamily: "Georgia, serif" }}
                      onFocus={(e) => (e.target.style.borderColor = "#d4af37")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    >
                      <option value="">Select a reason...</option>
                      {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>Additional Details</label>
                    <textarea
                      name="details"
                      value={form.details}
                      onChange={handleChange}
                      placeholder="Any additional information..."
                      rows={4}
                      style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", color: "#fff", outline: "none", fontFamily: "Georgia, serif", resize: "vertical" }}
                      onFocus={(e) => (e.target.style.borderColor = "#d4af37")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      width: "100%", background: loading ? "#555" : "#d4af37",
                      color: "#0a0a0a", border: "none", padding: "16px",
                      fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
                      cursor: loading ? "not-allowed" : "pointer", borderRadius: "2px", fontWeight: "700",
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Return Request →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
