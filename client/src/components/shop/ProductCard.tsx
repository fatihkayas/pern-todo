import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Watch } from "../../types";

interface ProductCardProps {
  watch: Watch;
  addToCart: (watch: Watch) => void;
  listView?: boolean;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

function resolveImage(url: string | undefined): string {
  if (!url) return PLACEHOLDER;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ color: "var(--brand-gold)", fontSize: "0.65rem", letterSpacing: 1 }}>
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
  </span>
);

const ProductCard = ({ watch, addToCart, listView = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);

  const inStock = (watch.stock_quantity ?? 0) > 0;
  const price = parseFloat(watch.price) || 0;

  if (listView) {
    return (
      <article
        className="d-flex gap-4 py-3"
        style={{ borderBottom: "var(--border-luxury)", fontFamily: "'Jost', sans-serif" }}
      >
        <button
          type="button"
          onClick={() => navigate(`/watch/${watch.watch_id}`)}
          style={{ border: "none", background: "#fff", padding: "8px", flexShrink: 0, cursor: "pointer" }}
        >
          <img
            src={resolveImage(watch.image_url)}
            alt={watch.watch_name}
            loading="lazy"
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </button>
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          <span style={{ fontSize: "0.68rem", color: "var(--brand-gold)", letterSpacing: "0.1em", fontWeight: 500 }}>
            {watch.brand?.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/watch/${watch.watch_id}`)}
            style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
          >
            <h3
              className="shop-serif mb-0"
              style={{ fontSize: "1rem", fontWeight: 400, color: "var(--brand-anthracite)" }}
            >
              {watch.watch_name}
            </h3>
          </button>
          {watch.model_code && (
            <span style={{ fontSize: "0.7rem", color: "#aaa" }}>{watch.model_code}</span>
          )}
        </div>
        <div className="d-flex flex-column align-items-end justify-content-center gap-2">
          <strong style={{ fontSize: "1.05rem", fontWeight: 500 }}>€{price.toFixed(2)}</strong>
          {inStock ? (
            <button
              type="button"
              onClick={() => addToCart(watch)}
              style={{
                background: "var(--brand-anthracite)",
                color: "#fff",
                border: "none",
                padding: "6px 20px",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
              }}
            >
              IN DEN WARENKORB
            </button>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "#bbb", letterSpacing: "0.08em" }}>DEMNÄCHST</span>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "var(--border-luxury)",
        fontFamily: "'Jost', sans-serif",
        position: "relative",
        transition: "box-shadow .2s",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.10)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Wishlist */}
      <button
        type="button"
        aria-label="Merken"
        onClick={() => setWished((w) => !w)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          fontSize: "1rem",
          cursor: "pointer",
          color: wished ? "var(--brand-gold)" : "#ccc",
          zIndex: 1,
          transition: "color .15s",
        }}
      >
        ♥
      </button>

      {/* Badge */}
      {!inStock && (
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "var(--brand-anthracite)",
            color: "#fff",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            padding: "2px 8px",
          }}
        >
          DEMNÄCHST
        </span>
      )}

      {/* Image */}
      <button
        type="button"
        onClick={() => navigate(`/watch/${watch.watch_id}`)}
        style={{
          border: "none",
          background: "var(--brand-light)",
          padding: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 180,
        }}
      >
        <img
          src={resolveImage(watch.image_url)}
          alt={watch.watch_name}
          loading="lazy"
          style={{
            maxHeight: 160,
            maxWidth: "100%",
            objectFit: "contain",
            transition: "transform .25s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            filter: watch.image_url ? "none" : "grayscale(30%)",
          }}
        />
      </button>

      {/* Body */}
      <div className="d-flex flex-column flex-grow-1 p-3">
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--brand-gold)",
            letterSpacing: "0.12em",
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {watch.brand?.toUpperCase()}
        </span>

        <button
          type="button"
          onClick={() => navigate(`/watch/${watch.watch_id}`)}
          style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
        >
          <h3
            className="shop-serif"
            style={{
              fontSize: "1rem",
              fontWeight: 400,
              color: "var(--brand-anthracite)",
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            {watch.watch_name}
          </h3>
        </button>

        {watch.model_code && (
          <span style={{ fontSize: "0.68rem", color: "#bbb", marginBottom: 8 }}>{watch.model_code}</span>
        )}

        <Stars rating={4} />

        <div className="d-flex align-items-center justify-content-between mt-auto pt-3">
          <strong style={{ fontSize: "1.05rem", fontWeight: 500, color: "var(--brand-anthracite)" }}>
            €{price.toFixed(2)}
          </strong>
          {inStock ? (
            <button
              type="button"
              onClick={() => addToCart(watch)}
              style={{
                background: hovered ? "var(--brand-gold)" : "var(--brand-anthracite)",
                color: "#fff",
                border: "none",
                padding: "7px 14px",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                fontFamily: "'Jost', sans-serif",
                transition: "background .2s",
              }}
            >
              + WARENKORB
            </button>
          ) : (
            <span style={{ fontSize: "0.65rem", color: "#ccc", letterSpacing: "0.08em" }}>DEMNÄCHST</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
