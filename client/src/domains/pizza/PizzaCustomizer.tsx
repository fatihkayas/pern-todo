import React, { useState } from "react";
import { Pizza, PizzaCartItem, PizzaOptions } from "../../types";

interface PizzaCustomizerProps {
  pizza: Pizza;
  onAdd: (item: PizzaCartItem) => void;
  onClose: () => void;
}

// Boyuta göre fiyat çarpanı
const SIZE_MULTIPLIER: Record<string, number> = { S: 1.0, M: 1.3, L: 1.6 };
const SIZE_LABEL: Record<string, string> = { S: "Küçük (25cm)", M: "Orta (30cm)", L: "Büyük (35cm)" };

const PizzaCustomizer: React.FC<PizzaCustomizerProps> = ({ pizza, onClose, onAdd }) => {
  const [size, setSize] = useState<PizzaOptions["size"]>("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const basePrice = parseFloat(pizza.base_price);
  const finalPrice = (basePrice * SIZE_MULTIPLIER[size]).toFixed(2);

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
    // Karartılmış arka plan (overlay)
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 style={styles.title}>{pizza.name}</h2>
        <p style={styles.desc}>{pizza.description}</p>

        {/* Boyut seçimi */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Boyut Seç</h4>
          <div style={styles.sizeRow}>
            {(pizza.sizes as string[]).map((s) => (
              <button
                key={s}
                style={{ ...styles.sizeBtn, ...(size === s ? styles.sizeBtnActive : {}) }}
                onClick={() => setSize(s as PizzaOptions["size"])}
              >
                <strong>{s}</strong>
                <span style={{ fontSize: 11 }}>{SIZE_LABEL[s]}</span>
                <span style={{ color: "#c0392b", fontWeight: 700 }}>
                  ${(basePrice * SIZE_MULTIPLIER[s]).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Topping seçimi */}
        <section style={styles.section}>
          <h4 style={styles.sectionTitle}>Ekstra Malzeme</h4>
          <div style={styles.toppingGrid}>
            {(pizza.toppings as string[]).map((t) => (
              <label key={t} style={styles.toppingLabel}>
                <input
                  type="checkbox"
                  checked={selectedToppings.includes(t)}
                  onChange={() => toggleTopping(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </section>

        {/* Özet + Ekle butonu */}
        <div style={styles.footer}>
          <span style={styles.total}>Toplam: <strong>${finalPrice}</strong></span>
          <button style={styles.addBtn} onClick={handleAdd}>
            Sepete Ekle
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
