import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Watch } from "../types";

function fixImageUrl(url: string | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
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

  useEffect(() => {
    fetch(`/api/watches`)
      .then((res) => res.json())
      .then((data: Watch[]) => {
        const found = data.find((w) => String(w.watch_id) === id);
        if (found) {
          setWatch(found);
        } else {
          toast.error("Saat bulunamadı");
          navigate("/");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Saat yüklenemedi");
        setLoading(false);
      });
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!watch) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(watch);
    }
    toast.success(`${quantity}x ${watch.watch_name} sepete eklendi! 🛒`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌚</div>
        <p style={{ color: "#888" }}>Yükleniyor...</p>
      </div>
    );
  }

  if (!watch) return null;

  const imageUrl = fixImageUrl(watch.image_url);

  const specs = [
    { label: "Marka", value: watch.brand },
    { label: "Model Kodu", value: watch.model_code || "N/A" },
    { label: "Stok", value: `${watch.stock_quantity || 0} adet` },
    { label: "Fiyat", value: `$${watch.price}` },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      <div style={{ background: "#fafaf8", padding: "16px 20px", borderBottom: "1px solid #e0e0e0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#888" }}>
            <span style={{ cursor: "pointer", color: "#d4af37" }} onClick={() => navigate("/")}>
              Store
            </span>
            {" / "}
            <span>{watch.watch_name}</span>
          </nav>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "60px 20px" }}>
        <div className="container">
          <div className="row align-items-start">
            <div className="col-md-6 mb-5 mb-md-0">
              <div style={{ background: "#fafaf8", borderRadius: "8px", padding: "40px", textAlign: "center" }}>
                <img
                  src={imageUrl}
                  alt={watch.watch_name}
                  style={{ maxWidth: "100%", maxHeight: "450px", objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                  }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div style={{ paddingLeft: "40px" }}>
                <p style={{ color: "#d4af37", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
                  {watch.brand}
                </p>
                <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "300", color: "#0a0a0a", marginBottom: "20px", lineHeight: "1.2" }}>
                  {watch.watch_name}
                </h1>
                <div style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: "700", color: "#d4af37", marginBottom: "28px" }}>
                  ${watch.price}
                </div>
                <p style={{ color: "#666", lineHeight: "1.8", fontSize: "15px", marginBottom: "32px" }}>
                  {watch.description}
                </p>

                <div style={{ border: "1px solid #e0e0e0", borderRadius: "4px", padding: "20px", marginBottom: "28px" }}>
                  <h5 style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#888", marginBottom: "16px" }}>
                    Özellikler
                  </h5>
                  {specs.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      paddingBottom: "10px", marginBottom: "10px",
                      borderBottom: i < specs.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}>
                      <span style={{ color: "#888", fontSize: "14px" }}>{s.label}</span>
                      <span style={{ color: "#0a0a0a", fontWeight: "600", fontSize: "14px" }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ background: "#f0f0f0", border: "none", width: "40px", height: "40px", borderRadius: "4px", cursor: "pointer", fontSize: "18px" }}>
                      −
                    </button>
                    <span style={{ fontSize: "18px", fontWeight: "600", minWidth: "30px", textAlign: "center" }}>
                      {quantity}
                    </span>
                    <button onClick={() => setQuantity(quantity + 1)}
                      style={{ background: "#f0f0f0", border: "none", width: "40px", height: "40px", borderRadius: "4px", cursor: "pointer", fontSize: "18px" }}>
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1, background: "#0a0a0a", color: "#d4af37", border: "none",
                      padding: "16px 32px", fontSize: "12px", letterSpacing: "3px",
                      textTransform: "uppercase", cursor: "pointer", borderRadius: "4px",
                      fontWeight: "700", transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#0a0a0a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#d4af37"; }}
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
