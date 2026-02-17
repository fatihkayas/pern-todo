import React, { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you within 24 hours. ✉️");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  const info = [
    { icon: "📍", title: "Address", detail: "1-2-3 Ginza, Chuo-ku, Tokyo, Japan" },
    { icon: "📞", title: "Phone", detail: "+90 212 555 0100" },
    { icon: "✉️", title: "Email", detail: "support@seikostore.com" },
    { icon: "🕐", title: "Hours", detail: "Mon–Fri, 9am–6pm (JST)" },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
        padding: "80px 20px",
        textAlign: "center",
      }}>
        <p style={{ color: "#d4af37", letterSpacing: "6px", fontSize: "11px", textTransform: "uppercase", marginBottom: "16px" }}>Get In Touch</p>
        <h1 style={{ color: "#fff", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: "300", marginBottom: "16px" }}>
          Contact <span style={{ color: "#d4af37", fontStyle: "italic" }}>Us</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "400px", margin: "0 auto" }}>
          We're here to help. Reach out and we'll respond within 24 hours.
        </p>
      </div>

      {/* Info Cards */}
      <div style={{ background: "#d4af37", padding: "40px 20px" }}>
        <div className="container">
          <div className="row">
            {info.map((i, idx) => (
              <div key={idx} className="col-6 col-md-3 mb-3 mb-md-0 text-center">
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{i.icon}</div>
                <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(0,0,0,0.6)", marginBottom: "4px" }}>{i.title}</div>
                <div style={{ fontSize: "13px", color: "#0a0a0a", fontWeight: "600" }}>{i.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: "#fafaf8", padding: "100px 20px" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div style={{ background: "#fff", borderRadius: "4px", padding: "48px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "300", marginBottom: "32px", color: "#0a0a0a", textAlign: "center" }}>
                  Send a Message
                </h2>

                <div className="mb-4">
                  <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>
                    Name *
                  </label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your full name"
                    style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", outline: "none", fontFamily: "Georgia, serif" }}
                    onFocus={e => e.target.style.borderColor = "#d4af37"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>
                    Email *
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="your@email.com"
                    style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", outline: "none", fontFamily: "Georgia, serif" }}
                    onFocus={e => e.target.style.borderColor = "#d4af37"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>
                    Subject
                  </label>
                  <input
                    type="text" name="subject" value={form.subject} onChange={handleChange}
                    placeholder="How can we help?"
                    style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", outline: "none", fontFamily: "Georgia, serif" }}
                    onFocus={e => e.target.style.borderColor = "#d4af37"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "8px", display: "block" }}>
                    Message *
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="Tell us more..."
                    rows={5}
                    style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: "2px", padding: "14px 16px", fontSize: "15px", outline: "none", fontFamily: "Georgia, serif", resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "#d4af37"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    width: "100%", background: sending ? "#ccc" : "#0a0a0a",
                    color: "#d4af37", border: "none", padding: "16px",
                    fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
                    cursor: sending ? "not-allowed" : "pointer", borderRadius: "2px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {sending ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
