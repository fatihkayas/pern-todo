import React from "react";

const StripeTrustBand = () => {
  return (
    <section id="trust" style={{ background: "#1a1a1a", color: "#F9F9F7" }}>
      <div className="container py-4 d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 44, height: 44, background: "rgba(212,175,55,0.18)", color: "#D4AF37" }}
          >
            🔒
          </div>
          <div>
            <div className="fw-semibold" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
              Stripe Trusted Checkout
            </div>
            <div className="small text-light-emphasis">
              Your payment is secured by Stripe. We never store your card details.
            </div>
          </div>
        </div>
        <div className="small" style={{ color: "#D4AF37" }}>
          PCI-DSS Ready • 3D Secure • Tokenized Payments
        </div>
      </div>
    </section>
  );
};

export default StripeTrustBand;

