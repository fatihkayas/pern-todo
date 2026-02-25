import React, { useEffect, useState } from "react";

const About = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const stats = [
    { number: "1892", label: "Founded" },
    { number: "150+", label: "Countries" },
    { number: "1M+", label: "Watches Sold" },
    { number: "5★", label: "Rating" },
  ];

  const team = [
    { name: "Kenji Watanabe", role: "Master Watchmaker", icon: "⚙️" },
    { name: "Yuki Tanaka", role: "Design Director", icon: "✏️" },
    { name: "Hana Sato", role: "Quality Control", icon: "🔍" },
  ];

  const values = [
    { icon: "⏱️", title: "Precision", desc: "Every movement engineered to 0.001mm tolerance. Time is not approximate." },
    { icon: "🌿", title: "Sustainability", desc: "Solar-powered movements, recycled materials, carbon-neutral shipping." },
    { icon: "🛡️", title: "Heritage", desc: "130 years of Japanese craftsmanship. Each watch carries our legacy." },
    { icon: "🔬", title: "Innovation", desc: "Spring Drive, Kinetic, GPS Solar — we define what's next in horology." },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", overflowX: "hidden" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 20px",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "5%",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
        }} />

        <div style={{
          textAlign: "center", zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s ease",
        }}>
          <p style={{ color: "#d4af37", letterSpacing: "6px", fontSize: "12px", marginBottom: "20px", textTransform: "uppercase" }}>
            Since 1892
          </p>
          <h1 style={{
            fontSize: "clamp(48px, 8vw, 96px)", color: "#ffffff",
            fontWeight: "300", letterSpacing: "-2px", lineHeight: "1",
            marginBottom: "24px",
          }}>
            The Art of<br />
            <span style={{ color: "#d4af37", fontStyle: "italic" }}>Time</span>
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: "18px",
            maxWidth: "500px", margin: "0 auto", lineHeight: "1.8",
            fontWeight: "300",
          }}>
            Japanese precision. Global legacy. Every second, perfected.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#d4af37", padding: "40px 20px" }}>
        <div className="container">
          <div className="row text-center">
            {stats.map((s, i) => (
              <div key={i} className="col-6 col-md-3 mb-3 mb-md-0">
                <div style={{ color: "#0a0a0a" }}>
                  <div style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-1px" }}>{s.number}</div>
                  <div style={{ fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.7 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div style={{ background: "#fafaf8", padding: "100px 20px" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-5 mb-md-0">
              <p style={{ color: "#d4af37", letterSpacing: "4px", fontSize: "11px", textTransform: "uppercase", marginBottom: "16px" }}>Our Story</p>
              <h2 style={{ fontSize: "42px", fontWeight: "300", lineHeight: "1.2", marginBottom: "24px", color: "#0a0a0a" }}>
                Born in Nagoya.<br />
                <em style={{ color: "#d4af37" }}>Worn worldwide.</em>
              </h2>
              <p style={{ color: "#666", lineHeight: "1.9", fontSize: "16px", marginBottom: "20px" }}>
                In 1892, Kintaro Hattori founded Seiko with a singular obsession:
                to create timepieces of uncompromising accuracy. What began as a
                small clock shop in Tokyo grew into one of the world's most
                respected watchmakers.
              </p>
              <p style={{ color: "#666", lineHeight: "1.9", fontSize: "16px" }}>
                Today, every Seiko watch carries that founding spirit — a relentless
                pursuit of perfection in every gear, every spring, every second.
              </p>
            </div>
            <div className="col-md-6">
              <div style={{
                background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
                borderRadius: "4px",
                padding: "60px 40px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "-20px", right: "-20px",
                  width: "200px", height: "200px", borderRadius: "50%",
                  border: "1px solid rgba(212,175,55,0.2)",
                }} />
                <div style={{
                  position: "absolute", bottom: "-40px", left: "-40px",
                  width: "300px", height: "300px", borderRadius: "50%",
                  border: "1px solid rgba(212,175,55,0.1)",
                }} />
                <div style={{ fontSize: "80px", marginBottom: "20px" }}>⌚</div>
                <p style={{ color: "#d4af37", fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase" }}>
                  Crafted in Japan
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "12px" }}>
                  Every component assembled by hand
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ background: "#0a0a0a", padding: "100px 20px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#d4af37", letterSpacing: "4px", fontSize: "11px", textTransform: "uppercase", marginBottom: "16px" }}>What We Stand For</p>
            <h2 style={{ color: "#fff", fontSize: "36px", fontWeight: "300" }}>Our Values</h2>
          </div>
          <div className="row">
            {values.map((v, i) => (
              <div key={i} className="col-md-6 mb-4">
                <div
                  style={{
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: "4px",
                    padding: "40px",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.6)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")}
                >
                  <div style={{ fontSize: "32px", marginBottom: "16px" }}>{v.icon}</div>
                  <h4 style={{ color: "#d4af37", fontWeight: "400", marginBottom: "12px", letterSpacing: "1px" }}>{v.title}</h4>
                  <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: "1.8", margin: 0, fontSize: "14px" }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ background: "#fafaf8", padding: "100px 20px" }}>
        <div className="container">
          <div className="text-center mb-5">
            <p style={{ color: "#d4af37", letterSpacing: "4px", fontSize: "11px", textTransform: "uppercase", marginBottom: "16px" }}>The People</p>
            <h2 style={{ fontSize: "36px", fontWeight: "300", color: "#0a0a0a" }}>Meet Our Team</h2>
          </div>
          <div className="row justify-content-center">
            {team.map((t, i) => (
              <div key={i} className="col-md-4 mb-4 text-center">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "4px",
                    padding: "48px 32px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "32px", margin: "0 auto 20px",
                  }}>{t.icon}</div>
                  <h5 style={{ color: "#0a0a0a", fontWeight: "600", marginBottom: "8px" }}>{t.name}</h5>
                  <p style={{ color: "#d4af37", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: "linear-gradient(135deg, #d4af37, #b8960c)",
        padding: "80px 20px",
        textAlign: "center",
      }}>
        <h2 style={{ color: "#0a0a0a", fontSize: "36px", fontWeight: "300", marginBottom: "16px" }}>
          Find Your Perfect Timepiece
        </h2>
        <p style={{ color: "rgba(0,0,0,0.6)", marginBottom: "32px", fontSize: "16px" }}>
          Explore our collection of precision-crafted watches
        </p>
        <a
          href="/"
          style={{
            background: "#0a0a0a", color: "#d4af37",
            padding: "16px 48px", borderRadius: "2px",
            textDecoration: "none", fontSize: "12px",
            letterSpacing: "3px", textTransform: "uppercase",
            display: "inline-block",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0a0a0a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#d4af37"; }}
        >
          Shop Now
        </a>
      </div>

    </div>
  );
};

export default About;
