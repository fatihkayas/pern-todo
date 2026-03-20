import React, { useState } from "react";
import { Pizza, PizzaCartItem } from "../../types";

interface PizzaCustomizerProps {
  pizza: Pizza;
  onAdd: (item: PizzaCartItem) => void;
  onClose: () => void;
}

const SIZE_MULTIPLIER: Record<string, number> = { S: 1, M: 1.3, L: 1.6 };
const SIZE_LABEL: Record<string, string> = { S: "Klein (25cm)", M: "Mittel (30cm)", L: "Groß (35cm)" };

const PizzaCustomizer: React.FC<PizzaCustomizerProps> = ({ pizza, onClose, onAdd }) => {
  const [size, setSize] = useState<string>(pizza.sizes[0] || "M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const basePrice = parseFloat(pizza.base_price);
  const finalPrice = (basePrice * (SIZE_MULTIPLIER[size] || 1)).toFixed(2);

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping]
    );
  };

  const handleAdd = () => {
    onAdd({
      ...pizza,
      cart_item_id: `${pizza.pizza_id}:${size}:${Date.now()}`,
      quantity: 1,
      options: { size, toppings: selectedToppings },
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>x</button>

        <h2 style={styles.title}>{pizza.name}</h2>
        <p style={styles.desc}>{pizza.description}</p>

        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Größe wählen</h4>
          <div style={styles.sizeRow}>
            {(pizza.sizes as string[]).map((entry) => (
              <button
                key={entry}
                style={{ ...styles.sizeBtn, ...(size === entry ? styles.sizeBtnActive : {}) }}
                onClick={() => setSize(entry)}
              >
                <strong>{entry}</strong>
                <span style={{ fontSize: 11 }}>{SIZE_LABEL[entry] || entry}</span>
                <span style={{ color: "#c0392b", fontWeight: 700 }}>
                  ${(basePrice * (SIZE_MULTIPLIER[entry] || 1)).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Extra Zutaten</h4>
          <div style={styles.toppingGrid}>
            {(pizza.toppings as string[]).map((entry) => (
              <label key={entry} style={styles.toppingLabel}>
                <input
                  type="checkbox"
                  checked={selectedToppings.includes(entry)}
                  onChange={() => toggleTopping(entry)}
                />
                {entry}
              </label>
            ))}
          </div>
        </section>

        <div style={styles.footer}>
          <span style={styles.total}>Gesamt: <strong>${finalPrice}</strong></span>
          <button style={styles.addBtn} onClick={handleAdd}>
            In den Warenkorb
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 480,
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },
  closeBtn: {
    position: "absolute", top: 12, right: 16,
    background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#666",
  },
  title: { margin: "0 0 6px", fontSize: 22, fontWeight: 700 },
  desc: { margin: "0 0 16px", color: "#666", fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "#333" },
  sizeRow: { display: "flex", gap: 10 },
  sizeBtn: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    gap: 3, padding: "10px 8px", border: "2px solid #eee",
    borderRadius: 10, cursor: "pointer", background: "#fafafa", fontSize: 13,
  },
  sizeBtnActive: { borderColor: "#c0392b", background: "#fff5f5" },
  toppingGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  toppingLabel: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 13, cursor: "pointer", color: "#333",
  },
  footer: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", paddingTop: 16,
    borderTop: "1px solid #eee", marginTop: 8,
  },
  total: { fontSize: 16, color: "#333" },
  addBtn: {
    background: "#c0392b", color: "#fff",
    border: "none", borderRadius: 10,
    padding: "10px 24px", fontSize: 15,
    fontWeight: 700, cursor: "pointer",
  },
};

export default PizzaCustomizer;
