import React, { useEffect, useMemo, useState } from "react";
import { Pizza, PizzaCartItem } from "../../types";
import { apiUrl } from "../../config";
import OrderModal from "./OrderModal";
import DonerFlowModal from "./DonerFlowModal";

const POPULAR_ITEMS = new Set(["Special Doner", "Calabrese", "Diavola", "Dorum Hahnchen"]);

const sectionMatches: Array<{ title: string; match: (item: Pizza) => boolean }> = [
  { title: "Doner Kebab", match: (item) => item.name.includes("Doner Kebab") },
  { title: "Durum", match: (item) => item.name.includes("Durum") },
  { title: "Spezial Doner", match: (item) => item.name.includes("Special Doner") && !item.name.includes("Teller") },
  { title: "Doner Teller", match: (item) => item.name.includes("Teller") },
  { title: "Doner Box", match: (item) => item.name.includes("Box") },
  { title: "Lahmacun", match: (item) => item.name.includes("Lahmacun") },
];

interface RestaurantPageProps {
  onDirectOrder: (item: PizzaCartItem) => void;
  onOpenCart: () => void;
}

const RestaurantPage: React.FC<RestaurantPageProps> = ({ onDirectOrder, onOpenCart }) => {
  const [items, setItems] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedDoner, setSelectedDoner] = useState<Pizza | null>(null);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 960);

  useEffect(() => {
    fetch(apiUrl("/api/v1/pizza"))
      .then((response) => response.json())
      .then((data: Pizza[]) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 960);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pizzas = useMemo(
    () => items.filter((item) => item.category === "pizza" || !item.category),
    [items]
  );
  const doners = useMemo(
    () => items.filter((item) => item.category === "doner"),
    [items]
  );

  const addPizzaItem = (item: Pizza) => {
    onDirectOrder({
      ...item,
      cart_item_id: `${item.pizza_id}:${Date.now()}`,
      quantity: 1,
      options: {
        size: item.sizes[0] || "Regular",
        toppings: [],
      },
    });
  };

  const handleCardOrder = (item: Pizza) => {
    if (item.category === "doner") {
      setSelectedDoner(item);
      return;
    }
    addPizzaItem(item);
  };

  const handleWebsiteOrder = () => {
    setOrderOpen(false);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroShade} />
        <div style={styles.heroGlow} />
        <div style={styles.heroContent}>
          <div style={styles.heroLabel}>Pizza and doner ordering experience</div>
          <h1 style={styles.heroTitle}>PIZZA & DONER</h1>
          <p style={styles.heroText}>
            Dark, fast, and touch-friendly ordering with rich food cards and a guided doner flow.
          </p>
          <button style={styles.heroButton} onClick={() => setOrderOpen(true)}>
            Jetzt bestellen
          </button>
        </div>
      </section>

      <button style={styles.stickyButton} onClick={() => setOrderOpen(true)}>
        Jetzt bestellen
      </button>

      <section id="menu" style={styles.menuWrap}>
        <div
          style={{
            ...styles.menuGrid,
            gridTemplateColumns: isCompact ? "1fr" : "minmax(0, 1fr) 1px minmax(0, 1fr)",
          }}
        >
          <MenuColumn
            anchor="pizza"
            label="Pizza menu"
            title="Left side: Pizza"
            loading={loading}
            items={pizzas}
            onOrder={handleCardOrder}
          />

          {isCompact ? null : <div style={styles.divider} />}

          <div id="doner" style={styles.column}>
            <div style={styles.columnHeader}>
              <span style={styles.columnLabel}>Doner menu</span>
              <h2 style={styles.columnTitle}>Right side: Doner</h2>
            </div>
            {loading ? (
              <MenuSkeleton />
            ) : (
              <div style={styles.sectionStack}>
                {sectionMatches.map((section) => (
                  <DonerSection
                    key={section.title}
                    title={section.title}
                    items={doners.filter(section.match)}
                    onOrder={handleCardOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <strong style={styles.footerBrand}>Pizza & Doner Haus</strong>
        <div>Large touch-friendly food cards, a guided doner builder, and direct checkout.</div>
        <button style={styles.footerDirectButton} onClick={onOpenCart}>
          Direkt bestellen
        </button>
      </footer>

      {orderOpen ? (
        <OrderModal onClose={() => setOrderOpen(false)} onDirectOrder={handleWebsiteOrder} />
      ) : null}

      {selectedDoner ? (
        <DonerFlowModal
          item={selectedDoner}
          onClose={() => setSelectedDoner(null)}
          onAddToCart={onDirectOrder}
        />
      ) : null}
    </div>
  );
};

const MenuColumn: React.FC<{
  anchor: string;
  label: string;
  title: string;
  loading: boolean;
  items: Pizza[];
  onOrder: (item: Pizza) => void;
}> = ({ anchor, label, title, loading, items, onOrder }) => (
  <div id={anchor} style={styles.column}>
    <div style={styles.columnHeader}>
      <span style={styles.columnLabel}>{label}</span>
      <h2 style={styles.columnTitle}>{title}</h2>
    </div>
    {loading ? (
      <MenuSkeleton />
    ) : (
      <div style={styles.cardGrid}>
        {items.map((item) => (
          <FoodCard key={item.pizza_id} item={item} onOrder={onOrder} />
        ))}
      </div>
    )}
  </div>
);

const DonerSection: React.FC<{
  title: string;
  items: Pizza[];
  onOrder: (item: Pizza) => void;
}> = ({ title, items, onOrder }) => {
  if (!items.length) return null;

  return (
    <div style={styles.sectionBlock}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.cardGrid}>
        {items.map((item) => (
          <FoodCard key={item.pizza_id} item={item} onOrder={onOrder} />
        ))}
      </div>
    </div>
  );
};

const FoodCard: React.FC<{ item: Pizza; onOrder: (item: Pizza) => void }> = ({ item, onOrder }) => {
  const [hovered, setHovered] = useState(false);
  const isPopular = POPULAR_ITEMS.has(item.name);

  return (
    <article
      style={{
        ...styles.foodCard,
        ...(hovered ? styles.foodCardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOrder(item)}
    >
      <div style={styles.imageWrap}>
        <img
          src={item.image_url || fallbackImage(item.category)}
          alt={item.name}
          style={styles.image}
        />
        {isPopular ? <span style={styles.popularBadge}>Popular</span> : null}
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>{item.name}</h3>
          <span style={styles.cardPrice}>{formatEuro(item.base_price)}</span>
        </div>
        <p style={styles.cardDescription}>{item.description}</p>
        <button
          style={styles.cardButton}
          onClick={(event) => {
            event.stopPropagation();
            onOrder(item);
          }}
        >
          {item.category === "doner" ? "Flow starten" : "Direkt bestellen"}
        </button>
      </div>
    </article>
  );
};

const MenuSkeleton: React.FC = () => (
  <div style={styles.cardGrid}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} style={styles.skeletonCard}>
        <div style={styles.skeletonImage} />
        <div style={styles.skeletonLineWide} />
        <div style={styles.skeletonLine} />
        <div style={styles.skeletonButton} />
      </div>
    ))}
  </div>
);

function fallbackImage(category?: string) {
  if (category === "doner") {
    return "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80";
  }
  return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";
}

function formatEuro(price: string) {
  const numeric = Number(price);
  return `${numeric.toFixed(2).replace(".", ",")} €`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(180, 30, 30, 0.18), transparent 32%), linear-gradient(180deg, #090909 0%, #131010 48%, #090909 100%)",
    color: "#fff7f0",
    paddingBottom: 80,
  },
  hero: {
    position: "relative",
    minHeight: 680,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "140px 20px 110px",
    background:
      "linear-gradient(rgba(8,8,8,0.45), rgba(8,8,8,0.82)), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=80') center/cover no-repeat",
    overflow: "hidden",
  },
  heroShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.76) 100%)",
  },
  heroGlow: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230,57,70,0.32) 0%, rgba(230,57,70,0) 72%)",
    filter: "blur(12px)",
  },
  heroContent: {
    position: "relative",
    maxWidth: 820,
    zIndex: 1,
  },
  heroLabel: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: "clamp(56px, 13vw, 132px)",
    lineHeight: 0.95,
    margin: "0 0 18px",
    fontWeight: 900,
    color: "#ff4d57",
    letterSpacing: "0.04em",
    textShadow: "0 14px 45px rgba(230,57,70,0.28)",
  },
  heroText: {
    maxWidth: 640,
    margin: "0 auto 28px",
    color: "rgba(255,247,240,0.85)",
    fontSize: 18,
    lineHeight: 1.7,
  },
  heroButton: {
    border: "none",
    borderRadius: 999,
    padding: "16px 32px",
    background: "linear-gradient(135deg, #e63946 0%, #ff6b35 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 24px 45px rgba(230,57,70,0.28)",
  },
  stickyButton: {
    position: "fixed",
    right: 22,
    bottom: 22,
    zIndex: 1200,
    border: "none",
    borderRadius: 999,
    padding: "14px 22px",
    background: "linear-gradient(135deg, #e63946 0%, #ff7a00 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(230,57,70,0.28)",
  },
  menuWrap: {
    maxWidth: 1400,
    margin: "-44px auto 0",
    padding: "0 24px",
    position: "relative",
    zIndex: 1,
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
    background: "rgba(17, 14, 14, 0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 32,
    overflow: "hidden",
    boxShadow: "0 30px 70px rgba(0,0,0,0.32)",
  },
  divider: {
    background: "linear-gradient(180deg, transparent 0%, rgba(230,57,70,0.4) 18%, rgba(230,57,70,0.4) 82%, transparent 100%)",
  },
  column: {
    padding: "34px 28px 30px",
  },
  columnHeader: {
    marginBottom: 22,
  },
  columnLabel: {
    display: "inline-block",
    color: "#ff8b8b",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    marginBottom: 10,
  },
  columnTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.05,
    fontWeight: 900,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },
  sectionStack: {
    display: "grid",
    gap: 26,
  },
  sectionBlock: {
    display: "grid",
    gap: 14,
  },
  sectionTitle: {
    color: "#ff8b8b",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  foodCard: {
    overflow: "hidden",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
  },
  foodCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 35px rgba(0,0,0,0.28)",
    background: "rgba(255,255,255,0.05)",
  },
  imageWrap: {
    position: "relative",
    aspectRatio: "4 / 3",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  popularBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(255, 180, 0, 0.15)",
    border: "1px solid rgba(255, 180, 0, 0.3)",
    color: "#ffcb54",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  cardBody: {
    padding: 18,
  },
  cardHeader: {
    display: "grid",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    margin: 0,
    color: "#fff",
    fontSize: 22,
    lineHeight: 1.1,
    fontWeight: 800,
  },
  cardPrice: {
    color: "#ff676f",
    fontWeight: 900,
    fontSize: 18,
  },
  cardDescription: {
    color: "rgba(255,247,240,0.7)",
    lineHeight: 1.6,
    minHeight: 68,
  },
  cardButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #e63946 0%, #ff6b35 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  skeletonCard: {
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 18,
  },
  skeletonImage: {
    aspectRatio: "4 / 3",
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  skeletonLineWide: {
    height: 18,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    marginBottom: 18,
  },
  skeletonButton: {
    height: 44,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
  },
  footer: {
    textAlign: "center",
    color: "rgba(255,247,240,0.65)",
    padding: "34px 20px 8px",
    fontSize: 14,
  },
  footerBrand: {
    display: "block",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: "0.08em",
  },
  footerDirectButton: {
    marginTop: 18,
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    background: "linear-gradient(135deg, #e63946 0%, #ff7a00 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default RestaurantPage;
