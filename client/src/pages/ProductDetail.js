import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`https://localhost:5000/watches`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((w) => w.watch_id === parseInt(id));
        if (found) {
          setWatch(found);
        } else {
          toast.error("Watch not found");
          navigate("/");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load watch");
        setLoading(false);
      });
  }, [id, navigate]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(watch);
    }
    toast.success(`${quantity}x ${watch.watch_name} added to cart! 🛒`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "'Georgia', serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⌚</div>
        <p style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  if (!watch) return null;

  const specs = [
    { label: "Brand", value: watch.brand },
    { label: "Model Code", value: watch.model_code || "N/A" },
    { label: "Stock", value: `${watch.stock_quantity || 0} units` },
    { label: "Added", value: new Date(watch.created_at).toLocaleDateString() },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fafaf8", padding: "16px 20px", borderBottom: "1px solid #e0e0e0" }}>
        <div className="container">
          <nav style={{ fontSize: "13px", color: "#888" }}>
            <span style={{ cursor: "pointer", color: "#d4af37" }} onClick={() => navigate("/")}>Store</span>
            {" / "}
            <span>{watch.watch_name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div style={{ background: "#fff", padding: "80px 20px" }}>
        <div className="container">
          <div className="row align-items-start">
            {/* Image */}
            <div className="col-md-6 mb-5 mb-md-0">
              <div style={{
                background: "#fafaf8",
                borderRadius: "4px",
                padding: "60px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <img
                  src={watch.image_url}
                  alt={watch.watch_name}
                  style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="col-md-6">
              <div style={{ paddingLeft: "40px" }}>
                <p style={{
                  color: "#d4af37",
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}>
                  {watch.brand}
                </p>

                <h1 style={{
                  fontSize: "clamp(32px, 5vw, 48px)",
                  fontWeight: "300",
                  color: "#0a0a0a",
                  marginBottom: "24px",
                  lineHeight: "1.2",
                }}>
                  {watch.watch_name}
                </h1>

                <div style={{
                  fontSize: "clamp(36px, 4vw, 48px)",
                  fontWeight: "700",
                  color: "#d4af37",
                  marginBottom: "32px",
                }}>
                  ${watch.price}
                </div>

                <p style={{
                  color: "#666",
                  lineHeight: "1.8",
                  fontSize: "16px",
                  marginBottom: "40px",
                }}>
                  {watch.description}
                </p>

                {/* Specs */}
                <div style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  padding: "24px",
                  marginBottom: "32px",
                }}>
                  <h5 style={{
                    fontSize: "12px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#888",
                    marginBottom: "20px",
                  }}>
                    Specifications
                  </h5>
                  {specs.map((s, i) => (
                    <div key={i} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: "12px",
                      marginBottom: "12px",
                      borderBottom: i < specs.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}>
                      <span style={{ color: "#888", fontSize: "14px" }}>{s.label}</span>
                      <span style={{ color: "#0a0a0a", fontWeight: "600", fontSize: "14px" }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity + Add to Cart */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        background: "#f0f0f0",
                        border: "none",
                        width: "40px",
                        height: "40px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: "18px", fontWeight: "600", minWidth: "30px", textAlign: "center" }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{
                        background: "#f0f0f0",
                        border: "none",
                        width: "40px",
                        height: "40px",
                        borderRadius: "2px",
                        cursor: "pointer",
                        fontSize: "18px",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1,
                      background: "#0a0a0a",
                      color: "#d4af37",
                      border: "none",
                      padding: "16px 32px",
                      fontSize: "12px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      borderRadius: "2px",
                      fontWeight: "700",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#d4af37";
                      e.currentTarget.style.color = "#0a0a0a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#0a0a0a";
                      e.currentTarget.style.color = "#d4af37";
                    }}
                  >
                    Add to Cart
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
