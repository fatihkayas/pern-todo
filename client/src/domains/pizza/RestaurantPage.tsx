import React from "react";
import heroImage from "../../assets/ranch-kebab-hero.png";
import { PizzaCartItem, RestaurantMenuItem } from "../../types";
import { restaurantMenuData } from "./menuData";
import DonerFlowModal from "./DonerFlowModal";

interface RestaurantPageProps {
  onDirectOrder: (item: PizzaCartItem) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const PALETTE = {
  background: "#f7f6f3",
  surface: "#ffffff",
  elevated: "#f0efeb",
  border: "#e2e0d8",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  accent: "#6bbbae",
  accentSoft: "rgba(107,187,174,0.12)",
  highlight: "#6bbbae",
  shadow: "0 2px 16px rgba(0,0,0,0.07)",
};

const RestaurantPage: React.FC<RestaurantPageProps> = ({
  onDirectOrder,
  onOpenCart,
  cartCount,
  cartTotal,
}) => {
  const categories = restaurantMenuData.categories;
  const [selectedItem, setSelectedItem] = React.useState<RestaurantMenuItem | null>(null);
  const [speisekarteOpen, setSpeisekarteOpen] = React.useState(false);
  const [activeCategoryId, setActiveCategoryId] = React.useState(categories[0]?.id ?? "");
  const [activeItemId, setActiveItemId] = React.useState<number | null>(categories[0]?.items[0]?.id ?? null);

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  const activeProduct =
    activeCategory?.items.find((item) => item.id === activeItemId) ?? activeCategory?.items[0];

  React.useEffect(() => {
    const hashMap: Record<string, string> = {
      "#doener": "doener",
      "#vegetarisch": "vegetarisch",
      "#salat": "salat",
      "#vorspeisen": "vorspeisen",
      "#softdrinks": "softdrinks",
      "#dessert": "dessert",
    };

    const applyHash = () => {
      const nextCategoryId = hashMap[window.location.hash.toLowerCase()];
      if (nextCategoryId) {
        setActiveCategoryId(nextCategoryId);
        document.getElementById("menu-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  React.useEffect(() => {
    if (!activeCategory) return;
    setActiveItemId(activeCategory.items[0]?.id ?? null);
  }, [activeCategoryId, activeCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    window.setTimeout(() => {
      document.getElementById("category-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroVisual} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroTextBlock}>
            <div style={styles.heroEyebrow}>RANCH KEBAB</div>
            <h1 style={styles.heroTitle}>Kategorie waehlen und nach unten durchscrollen.</h1>
            <p style={styles.heroCopy}>
              Horizontales Schieben ist entfernt. Wenn du auf Doener, Vegetarisch oder eine
              andere Kategorie klickst, werden alle Produkte direkt darunter angezeigt.
            </p>
            <div style={styles.heroActions}>
              <button style={styles.primaryButton} onClick={() => setSelectedItem(activeProduct ?? null)}>
                Jetzt bestellen
              </button>
              <button style={styles.secondaryButton} onClick={() => setSpeisekarteOpen(true)}>
                Speisekarte
              </button>
              <button style={styles.ghostButton} onClick={onOpenCart}>
                Warenkorb
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="menu-top" style={styles.pageBody}>
        <div style={styles.stickyCategoryWrap}>
          <div style={styles.categoryBar}>
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  style={{
                    ...styles.categoryChip,
                    ...(isActive ? styles.categoryChipActive : {}),
                  }}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {activeCategory ? (
          <section id="category-products" style={styles.focusSection}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionEyebrow}>AUSGEWAEHLTE KATEGORIE</div>
                <h2 style={styles.sectionTitle}>{activeCategory.name}</h2>
                <p style={styles.sectionSubtitle}>
                  {activeCategory.items.length} Produkte in dieser Kategorie. Scrolle einfach nach
                  unten, um alle Menues zu sehen.
                </p>
              </div>
              <div style={styles.categorySummaryBadge}>{activeCategory.items.length} Produkte</div>
            </div>

            <div style={styles.productGrid}>
              {activeCategory.items.map((item) => {
                const isActive = item.id === activeItemId;

                return (
                  <article
                    key={item.id}
                    style={{
                      ...styles.card,
                      ...(isActive ? styles.cardActive : {}),
                    }}
                    onMouseEnter={() => setActiveItemId(item.id)}
                    onClick={() => setActiveItemId(item.id)}
                  >
                    <div style={styles.cardImageWrap}>
                      <img src={item.image_url} alt={item.name} style={styles.cardImage} />
                      <div style={styles.priceBadge}>{formatEuro(item.price)}</div>
                    </div>
                    <div style={styles.cardBody}>
                      <h3 style={styles.cardTitle}>{item.name}</h3>
                      <p style={styles.cardDescription}>
                        {item.description || "Frisch zubereitet und direkt aus der Ranch Kebab Kueche."}
                      </p>
                      <button
                        type="button"
                        style={styles.cardButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedItem(item);
                        }}
                      >
                        Auswaehlen
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section style={styles.bottomPanel}>
          <div style={styles.bottomCard}>
            <div style={styles.bottomEyebrow}>Aktive Auswahl</div>
            <div style={styles.bottomTitle}>{activeProduct?.name ?? "Noch nichts gewaehlt"}</div>
            <div style={styles.bottomText}>
              {activeProduct?.description ||
                "Waehle oben eine Kategorie und scrolle dann nach unten durch alle Produkte."}
            </div>
          </div>

          <div style={styles.bottomCard}>
            <div style={styles.bottomEyebrow}>Schnellzugriff</div>
            <div style={styles.bottomTitle}>{cartCount} Artikel im Warenkorb</div>
            <div style={styles.bottomPrice}>{formatEuro(cartTotal)}</div>
            <button type="button" style={styles.bottomButton} onClick={onOpenCart}>
              Checkout
            </button>
          </div>
        </section>
      </div>

      {selectedItem ? (
        <DonerFlowModal
          item={selectedItem}
          drinks={restaurantMenuData.drinks.items}
          sauces={restaurantMenuData.sauces.options}
          maxFreeSauces={restaurantMenuData.sauces.maxFree}
          onClose={() => setSelectedItem(null)}
          onAddToCart={onDirectOrder}
        />
      ) : null}

      {speisekarteOpen ? (
        <div style={styles.menuOverlay} onClick={() => setSpeisekarteOpen(false)}>
          <img
            src="/speisekarte.png"
            alt="Speisekarte"
            style={styles.menuOverlayImage}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
};

function formatEuro(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: PALETTE.background,
    color: PALETTE.text,
  },
  hero: {
    position: "relative",
    padding: "120px 20px 56px",
    overflow: "hidden",
  },
  heroVisual: {
    position: "absolute",
    inset: "28px 20px auto 20px",
    height: 500,
    borderRadius: 36,
    background: `linear-gradient(90deg, rgba(247,246,243,0.9) 0%, rgba(247,246,243,0.36) 48%), url(${heroImage}) center / cover no-repeat`,
    boxShadow: PALETTE.shadow,
  },
  heroOverlay: {
    position: "absolute",
    inset: "28px 20px auto 20px",
    height: 500,
    borderRadius: 36,
    background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.18) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1180,
    margin: "0 auto",
    minHeight: 500,
    display: "flex",
    alignItems: "flex-end",
  },
  heroTextBlock: {
    padding: "34px 18px 28px",
  },
  heroEyebrow: {
    color: PALETTE.accent,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 16,
  },
  heroTitle: {
    margin: 0,
    maxWidth: 720,
    fontSize: "clamp(42px, 7vw, 74px)",
    lineHeight: 1.02,
    fontWeight: 900,
    color: PALETTE.text,
  },
  heroCopy: {
    maxWidth: 640,
    margin: "18px 0 0",
    color: PALETTE.muted,
    fontSize: 18,
    lineHeight: 1.8,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 28,
  },
  primaryButton: {
    minHeight: 54,
    padding: "0 24px",
    borderRadius: 999,
    border: "none",
    background: PALETTE.highlight,
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    minHeight: 54,
    padding: "0 24px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: "rgba(255,255,255,0.72)",
    color: PALETTE.text,
    fontWeight: 800,
    cursor: "pointer",
  },
  ghostButton: {
    minHeight: 54,
    padding: "0 24px",
    borderRadius: 999,
    border: `1px solid ${PALETTE.border}`,
    background: "transparent",
    color: PALETTE.accent,
    fontWeight: 800,
    cursor: "pointer",
  },
  pageBody: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 20px 72px",
  },
  stickyCategoryWrap: {
    position: "sticky",
    top: 92,
    zIndex: 30,
    marginTop: 18,
    marginBottom: 28,
  },
  categoryBar: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    padding: 10,
    borderRadius: 999,
    background: "#ffffff",
    border: `1px solid ${PALETTE.border}`,
    boxShadow: PALETTE.shadow,
  },
  categoryChip: {
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 999,
    border: "none",
    background: PALETTE.elevated,
    color: PALETTE.text,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.25s ease",
  },
  categoryChipActive: {
    background: PALETTE.highlight,
    color: "#ffffff",
  },
  focusSection: {
    padding: "8px 0 12px",
  },
  sectionHeader: {
    display: "flex",
    gap: 18,
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  sectionEyebrow: {
    color: PALETTE.accent,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(30px, 4vw, 48px)",
    lineHeight: 1.04,
    fontWeight: 900,
  },
  sectionSubtitle: {
    margin: "10px 0 0",
    maxWidth: 640,
    color: PALETTE.muted,
    lineHeight: 1.7,
  },
  categorySummaryBadge: {
    minHeight: 44,
    padding: "0 16px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: PALETTE.accentSoft,
    color: PALETTE.accent,
    fontWeight: 800,
    border: `1px solid ${PALETTE.border}`,
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    borderRadius: 30,
    background: PALETTE.surface,
    border: `1px solid ${PALETTE.border}`,
    overflow: "hidden",
    boxShadow: PALETTE.shadow,
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
    cursor: "pointer",
  },
  cardActive: {
    transform: "translateY(-4px)",
    borderColor: PALETTE.accent,
    boxShadow: "0 18px 32px rgba(0,0,0,0.12)",
  },
  cardImageWrap: {
    position: "relative",
    height: 240,
    background: "#ece8e1",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  priceBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    padding: "10px 14px",
    borderRadius: 999,
    background: PALETTE.highlight,
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 15,
  },
  cardBody: {
    padding: "22px 22px 24px",
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.12,
    fontWeight: 900,
    color: PALETTE.text,
  },
  cardDescription: {
    margin: "12px 0 0",
    minHeight: 54,
    color: PALETTE.muted,
    lineHeight: 1.7,
  },
  cardButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 20,
    borderRadius: 999,
    border: "none",
    background: PALETTE.highlight,
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  bottomPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
    marginTop: 26,
  },
  bottomCard: {
    padding: 24,
    borderRadius: 28,
    background: PALETTE.surface,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: PALETTE.shadow,
  },
  bottomEyebrow: {
    color: PALETTE.accent,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  bottomTitle: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.15,
    color: PALETTE.text,
  },
  bottomText: {
    marginTop: 10,
    color: PALETTE.muted,
    lineHeight: 1.7,
  },
  bottomPrice: {
    marginTop: 8,
    color: PALETTE.accent,
    fontSize: 28,
    fontWeight: 900,
  },
  bottomButton: {
    minHeight: 50,
    padding: "0 20px",
    marginTop: 18,
    borderRadius: 999,
    border: "none",
    background: PALETTE.accent,
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  menuOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20, 20, 20, 0.45)",
    zIndex: 2100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backdropFilter: "blur(4px)",
  },
  menuOverlayImage: {
    maxWidth: "100%",
    maxHeight: "90vh",
    borderRadius: 18,
    boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
  },
};

export default RestaurantPage;
