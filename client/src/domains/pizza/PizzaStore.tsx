import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pizza, PizzaCartItem } from "../../types";
import { apiUrl } from "../../config";
import PizzaCard from "./PizzaCard";
import PizzaCustomizer from "./PizzaCustomizer";

interface PizzaStoreProps {
  addToCart: (item: PizzaCartItem) => void;
}

const PizzaStore: React.FC<PizzaStoreProps> = ({ addToCart }) => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Pizza | null>(null); // Customizer'da açık pizza

  useEffect(() => {
    fetch(apiUrl("/api/v1/pizza"))
      .then((res) => res.json())
      .then((data: Pizza[]) => {
        setPizzas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Menü yüklenemedi ❌");
        setLoading(false);
      });
  }, []);

  const handleAdd = (item: PizzaCartItem) => {
    addToCart(item);
    toast.success(`${item.name} (${item.options.size}) sepete eklendi ✅`);
  };

  return (
    <main style={styles.page}>
      {/* Hero Banner */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🍕 Pizza Express</h1>
        <p style={styles.heroSub}>Fresh. Hot. Delivered.</p>
      </div>

      {/* Pizza Grid */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Menümüz</h2>

        {loading ? (
          <p style={{ color: "#999", textAlign: "center" }}>Menü yükleniyor...</p>
        ) : (
          <div style={styles.grid}>
            {pizzas.map((pizza) => (
              <PizzaCard
                key={pizza.pizza_id}
                pizza={pizza}
                onCustomize={(p) => setSelected(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Seçili pizzanın customizer modalı */}
      {selected && (
        <PizzaCustomizer
          pizza={selected}
          onAdd={handleAdd}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#fdf6f0",
    minHeight: "100vh",
  },
  hero: {
    background: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
    color: "#fff",
    textAlign: "center",
    padding: "60px 20px",
  },
  heroTitle: {
    margin: 0,
    fontSize: 48,
    fontWeight: 800,
    letterSpacing: -1,
  },
  heroSub: {
    margin: "10px 0 0",
    fontSize: 18,
    opacity: 0.9,
  },
  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    color: "#1a1a1a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 24,
  },
};

export default PizzaStore;
