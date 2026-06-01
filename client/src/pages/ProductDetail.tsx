import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Watch } from "../types";
import { apiUrl } from "../config";

function resolveImage(url: string | null | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
  const gdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (gdMatch) return `https://drive.google.com/uc?export=view&id=${gdMatch[1]}`;
  return url;
}

function formatPrice(price: string | number): string {
  const n = parseFloat(String(price));
  return isNaN(n) ? "—" : `€${n.toFixed(2).replace(".", ",")}`;
}

interface ProductDetailProps {
  addToCart: (watch: Watch) => void;
}

const ProductDetail = ({ addToCart }: ProductDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setWatch(null);
    fetch(apiUrl(`/api/v1/watches/${id}`))
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: Watch) => {
        setWatch(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Produkt nicht gefunden.");
        navigate("/uhren");
      });
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!watch) return;
    for (let i = 0; i < quantity; i++) addToCart(watch);
    setAdded(true);
    toast.success(`${quantity}× ${watch.watch_name} zum Warenkorb hinzugefügt`);
    setTimeout(() => setAdded(false), 2000);
  };

  const inStock = (watch?.stock_quantity ?? 0) > 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          paddingTop: 160,
          background: "var(--brand-light)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "'Jost', sans-serif",
          color: "#aaa",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #e0e0e0", borderTopColor: "var(--brand-gold)", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: "0.78rem", letterSpacing: "0.12em" }}>WIRD GELADEN</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!watch) return null;

  const imageUrl = imgError
    ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"
    : resolveImage(watch.image_url);

  const specs: { label: string; value: string }[] = [
    { label: "Marke", value: watch.brand || "—" },
    { label: "Referenz", value: watch.model_code || "—" },
    { label: "Preis", value: formatPrice(watch.price) },
    { label: "Verfügbarkeit", value: inStock ? `${watch.stock_quantity} auf Lager` : "Nicht verfügbar" },
  ];

  return (
    <div style={{ background: "var(--brand-light)", minHeight: "100vh", paddingTop: 136 }}>
      {/* Breadcrumb */}
      <div
        style={{
          borderBottom: "var(--border-luxury)",
          background: "#fff",
          padding: "12px 0",
        }}
      >
        <div className="container">
          <nav
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              color: "#999",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Link to="/" style={{ color: "#999", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-gold)")} onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}>HOME</Link>
            <span>/</span>
            <Link to="/uhren" style={{ color: "#999", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-gold)")} onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}>UHREN</Link>
            <span>/</span>
            <span style={{ color: "var(--brand-anthracite)" }}>{watch.watch_name}</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-5">
        <div className="row g-5 align-items-start">

          {/* Image column */}
          <div className="col-12 col-md-6">
            <div
              style={{
                background: "#fff",
                border: "var(--border-luxury)",
                padding: "48px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 420,
                position: "relative",
              }}
            >
              {/* Stock badge */}
              {!inStock && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: "var(--brand-anthracite)",
                    color: "#fff",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.14em",
                    padding: "4px 10px",
                  }}
                >
                  DEMNÄCHST
                </div>
              )}
              <img
                src={imageUrl}
                alt={watch.watch_name}
                onError={() => setImgError(true)}
                style={{
                  maxWidth: "100%",
                  maxHeight: 380,
                  objectFit: "contain",
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
              />
            </div>
          </div>

          {/* Info column */}
          <div className="col-12 col-md-6">
            {/* Brand */}
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: "var(--brand-gold)",
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {watch.brand}
            </p>

            {/* Name */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "var(--brand-anthracite)",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {watch.watch_name}
            </h1>

            {/* Price */}
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 300,
                color: "var(--brand-anthracite)",
                marginBottom: 8,
                letterSpacing: "0.02em",
              }}
            >
              {formatPrice(watch.price)}
            </div>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.72rem",
                color: "#aaa",
                letterSpacing: "0.08em",
                marginBottom: 32,
              }}
            >
              inkl. MwSt. · zzgl. Versandkosten
            </p>

            {/* Description */}
            {watch.description && (
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  color: "#666",
                  marginBottom: 32,
                }}
              >
                {watch.description}
              </p>
            )}

            {/* Divider */}
            <div style={{ borderTop: "var(--border-luxury)", marginBottom: 28 }} />

            {/* Specs table */}
            <div style={{ marginBottom: 32 }}>
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < specs.length - 1 ? "1px solid #f0ede8" : "none",
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase" }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: s.label === "Verfügbarkeit" && inStock ? "#3a7d44" : "var(--brand-anthracite)",
                      fontWeight: 500,
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Quantity + Add to cart */}
            {inStock ? (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Qty selector */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "var(--border-luxury)",
                    background: "#fff",
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: 40,
                      height: 48,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      color: "var(--brand-anthracite)",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: 36,
                      textAlign: "center",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(q + 1, watch.stock_quantity ?? 10))}
                    style={{
                      width: 40,
                      height: 48,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      color: "var(--brand-anthracite)",
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* CTA */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    height: 48,
                    background: added ? "var(--brand-gold)" : "var(--brand-anthracite)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    transition: "background 0.2s",
                  }}
                >
                  {added ? "✓  HINZUGEFÜGT" : "IN DEN WARENKORB"}
                </button>
              </div>
            ) : (
              <button
                disabled
                style={{
                  width: "100%",
                  height: 48,
                  background: "#e8e8e8",
                  color: "#aaa",
                  border: "none",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "not-allowed",
                }}
              >
                NICHT VERFÜGBAR
              </button>
            )}

            {/* Trust signals */}
            <div
              className="d-flex gap-3 mt-4 flex-wrap"
              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.68rem", letterSpacing: "0.08em", color: "#aaa" }}
            >
              <span>✓ Kostenloser Versand ab €150</span>
              <span>✓ 14 Tage Rückgabe</span>
              <span>✓ Sichere Zahlung</span>
            </div>
          </div>
        </div>

        {/* Back to catalog */}
        <div className="mt-5 pt-4" style={{ borderTop: "var(--border-luxury)" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "var(--border-luxury)",
              padding: "10px 28px",
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              color: "#888",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--brand-anthracite)";
              e.currentTarget.style.borderColor = "var(--brand-anthracite)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#888";
              e.currentTarget.style.borderColor = "#e0ddd8";
            }}
          >
            ← ZURÜCK ZUR ÜBERSICHT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
