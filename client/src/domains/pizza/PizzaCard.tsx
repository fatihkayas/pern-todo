import React from "react";
import { Pizza } from "../../types";

interface PizzaCardProps {
  pizza: Pizza;
  onCustomize: (pizza: Pizza) => void;
}

const PizzaCard: React.FC<PizzaCardProps> = ({ pizza, onCustomize }) => {
  return (
    <div style={styles.card}>
      <img
        src={pizza.image_url || "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"}
        alt={pizza.name}
        style={styles.image}
      />
      <div style={styles.body}>
        <h3 style={styles.name}>{pizza.name}</h3>
        <p style={styles.description}>{pizza.description}</p>

        {/* Topping etiketleri */}
        <div style={styles.toppings}>
          {pizza.toppings.slice(0, 3).map((t) => (
            <span key={t} style={styles.tag}>
              {t}
            </span>
          ))}
        </div>

        <div style={styles.footer}>
          <span style={styles.price}>${parseFloat(pizza.base_price).toFixed(2)}'den başlar</span>
          <button style={styles.button} onClick={() => onCustomize(pizza)}>
            Özelleştir & Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s",
  },
  image: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  body: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },
  name: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  description: {
    margin: 0,
    fontSize: 13,
    color: "#666",
    lineHeight: 1.5,
  },
  toppings: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    background: "#fff3e0",
    color: "#e67e22",
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 500,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 8,
  },
  price: {
    fontWeight: 700,
    color: "#c0392b",
    fontSize: 15,
  },
  button: {
    background: "#c0392b",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default PizzaCard;
