import React from "react";
import { MenuDrinkItem, PizzaCartItem, RestaurantMenuItem } from "../../types";
import DonerFlowModal from "./DonerFlowModal";
import { restaurantMenuData } from "./menuData";
import heroImage from "../../assets/ranch-kebab-hero.png";

interface RestaurantPageProps {
  onDirectOrder: (item: PizzaCartItem) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartTotal: number;
}

type SectionConfig = {
  id: string;
  label: string;
  subtitle: string;
  type: "menu" | "drinks";
};

const SECTION_CONFIG: SectionConfig[] = [
  { id: "doener", label: "Döner", subtitle: "Klassiker vom Spieß, als Brot, Dürüm, Box oder Teller.", type: "menu" },
  { id: "vegetarisch", label: "Vegetarisch", subtitle: "Gemüsebetonte Favoriten mit vollem Ranch-Trade Charakter.", type: "menu" },
  { id: "falafel", label: "Falafel", subtitle: "Knusprige Falafel-Varianten, klar präsentiert und schnell konfiguriert.", type: "menu" },
  { id: "salateBeilagen", label: "Salate & Beilagen", subtitle: "Leichte Teller, warme Beilagen und kleine Extras.", type: "menu" },
  { id: "getraenke", label: "Getränke", subtitle: "Softdrinks aus der Karte, optional im Konfigurator wählbar.", type: "drinks" },
];

const PALETTE = {
  background: "#111111",
  surface: "#1E1A17",
  elevated: "#2A241F",
  light: "#E7D7BE",
  sand: "#D6C2A1",
  gold: "#C1863B",
  leather: "#8B5E3C",
  saddle: "#A66A43",
  text: "#F7F1E8",
  muted: "#D8CBB8",
  textOnLight: "#2A1F18",
};

const RestaurantPage: React.FC<RestaurantPageProps> = ({
  onDirectOrder,
  onOpenCart,
  cartCount,
  cartTotal,
}) => {
  const [selectedItem, setSelectedItem] = React.useState<RestaurantMenuItem | null>(null);
  const [activeSection, setActiveSection] = React.useState<string>("doener");
  const [isCompact, setIsCompact] = React.useState(() => window.innerWidth < 992);

  React.useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 992);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-25% 0px -50% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    SECTION_CONFIG.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroBackdrop} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroAccentLeft} />
        <div style={styles.heroAccentRight} />
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>Ranch-Trade Signature Menu</div>
          <h1 style={styles.heroTitle}>Ranch-Trade bringt den Westen auf den Teller.</h1>
          <p style={styles.heroText}>
            Premium Döner, Falafel, Salate und Beilagen in einer modernen Bestellstrecke mit
            klaren Schritten, ruhiger Typografie und einer warmen Ranch-Atmosphäre.
          </p>
          <div style={styles.heroActions}>
            <button style={styles.primaryCta} onClick={onOpenCart}>
              Jetzt bestellen
            </button>
            <button style={styles.secondaryCta} onClick={() => scrollToSection("menu-top")}>
              Menü entdecken
            </button>
          </div>
          <div style={styles.heroStats}>
            <HeroStat label="Bestellfluss" value="Klar & schnell" />
            <HeroStat label="Soßen" value="Bis zu 3 gratis" />
            <HeroStat label="Getränke" value="Optional addierbar" />
          </div>
        </div>
      </section>

      <section id="menu-top" style={styles.shell}>
        <div style={styles.stickyNavWrap}>
          <div style={styles.stickyNav}>
            {SECTION_CONFIG.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    ...styles.navPill,
                    ...(isActive ? styles.navPillActive : {}),
                  }}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...styles.contentGrid, gridTemplateColumns: isCompact ? "1fr" : "minmax(0, 1fr) 320px" }}>
          <div style={styles.contentColumn}>
            {SECTION_CONFIG.map((section) =>
              section.type === "menu" ? (
                <MenuSection
                  key={section.id}
                  id={section.id}
                  title={section.label}
                  subtitle={section.subtitle}
                  items={restaurantMenuData.categories.find((category) => category.id === section.id)?.items || []}
                  onSelect={setSelectedItem}
                />
              ) : (
                <DrinksSection
                  key={section.id}
                  id={section.id}
                  title={section.label}
                  subtitle={section.subtitle}
                  drinks={restaurantMenuData.drinks.items}
                />
              )
            )}
          </div>

          {!isCompact ? (
            <aside style={styles.summaryAside}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryEyebrow}>Warenkorb</div>
                <h3 style={styles.summaryTitle}>Deine Ranch-Trade Auswahl</h3>
                <p style={styles.summaryText}>
                  Auf Desktop bleibt die Zusammenfassung sichtbar. So behältst du Menge und
                  Gesamtpreis jederzeit im Blick.
                </p>
                <div style={styles.summaryMetrics}>
                  <SummaryMetric label="Artikel" value={String(cartCount)} />
                  <SummaryMetric label="Gesamtpreis" value={formatEuro(cartTotal)} />
                </div>
                <button style={styles.summaryButton} onClick={onOpenCart}>
                  Zum Warenkorb
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {isCompact ? (
        <div style={styles.mobileSummaryBar}>
          <div>
            <div style={styles.mobileSummaryLabel}>Warenkorb</div>
            <div style={styles.mobileSummaryValue}>
              {cartCount} Artikel · {formatEuro(cartTotal)}
            </div>
          </div>
          <button style={styles.mobileSummaryButton} onClick={onOpenCart}>
            Öffnen
          </button>
        </div>
      ) : null}

      <footer style={styles.footer}>
        <strong style={styles.footerBrand}>Ranch-Trade</strong>
        <div>Modernes Cowboy-Feeling, klare Produktstruktur und ein ruhiger Bestellfluss von Auswahl bis Checkout.</div>
      </footer>

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
    </div>
  );
};

const MenuSection: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  items: RestaurantMenuItem[];
  onSelect: (item: RestaurantMenuItem) => void;
}> = ({ id, title, subtitle, items, onSelect }) => (
  <section id={id} style={styles.sectionCard}>
    <SectionHeader title={title} subtitle={subtitle} />
    <div style={styles.menuGrid}>
      {items.map((item) => (
        <article key={item.id} style={styles.productCard}>
          <div style={styles.productMedia}>
            <img src={item.image_url} alt={item.name} style={styles.productImage} />
            <div style={styles.priceTag}>{formatEuro(item.price)}</div>
          </div>
          <div style={styles.productBody}>
            <div style={styles.productTop}>
              <h3 style={styles.productTitle}>{item.name}</h3>
              {item.allergens?.length ? (
                <span style={styles.allergenTag}>Allergene {item.allergens.join(", ")}</span>
              ) : null}
            </div>
            <p style={styles.productDescription}>{item.description}</p>
            <div style={styles.productMeta}>
              <span>{item.flow.sideRequired ? "Mit Beilage" : "Ohne Beilage"}</span>
              <span>
                {item.flow.saucesIncluded > 0
                  ? `${item.flow.saucesIncluded} kostenlose Soßen`
                  : "Keine Soßen-Auswahl"}
              </span>
            </div>
            <button style={styles.selectButton} onClick={() => onSelect(item)}>
              Auswählen
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const DrinksSection: React.FC<{
  id: string;
  title: string;
  subtitle: string;
  drinks: MenuDrinkItem[];
}> = ({ id, title, subtitle, drinks }) => (
  <section id={id} style={styles.sectionCard}>
    <SectionHeader title={title} subtitle={subtitle} />
    <div style={styles.drinksPanel}>
      <div style={styles.drinksInfo}>
        <div style={styles.drinksEyebrow}>Softdrinks 0,33 l</div>
        <p style={styles.drinksText}>
          Diese Auswahl steht im Konfigurator zur Verfügung und wird direkt zum Gesamtpreis
          addiert, sobald ein Getränk gewählt wird.
        </p>
      </div>
      <div style={styles.drinksGrid}>
        {drinks.map((drink) => (
          <div key={drink.id} style={styles.drinkCard}>
            <div style={styles.drinkName}>{drink.name}</div>
            <div style={styles.drinkPrice}>{formatEuro(drink.price)}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div style={styles.sectionHeader}>
    <div style={styles.sectionRule} />
    <div>
      <div style={styles.sectionEyebrow}>Kategorie</div>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.sectionSubtitle}>{subtitle}</p>
    </div>
  </div>
);

const HeroStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.heroStat}>
    <div style={styles.heroStatValue}>{value}</div>
    <div style={styles.heroStatLabel}>{label}</div>
  </div>
);

const SummaryMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.summaryMetric}>
    <div style={styles.summaryMetricLabel}>{label}</div>
    <div style={styles.summaryMetricValue}>{value}</div>
  </div>
);

function formatEuro(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      `linear-gradient(180deg, ${PALETTE.background} 0%, #171311 48%, ${PALETTE.background} 100%)`,
    color: PALETTE.text,
    paddingBottom: 120,
  },
  hero: {
    position: "relative",
    minHeight: 760,
    display: "flex",
    alignItems: "flex-end",
    padding: "140px 24px 88px",
    background: `${PALETTE.background}`,
    overflow: "hidden",
  },
  heroBackdrop: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(100deg, rgba(17,17,17,0.82) 12%, rgba(17,17,17,0.45) 50%, rgba(17,17,17,0.9) 100%), url(${heroImage}) center top / cover no-repeat`,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at top right, rgba(193,134,59,0.18) 0%, rgba(193,134,59,0) 42%)",
  },
  heroAccentLeft: {
    position: "absolute",
    left: -120,
    top: 120,
    width: 320,
    height: 320,
    borderRadius: "50%",
    border: `1px solid rgba(231, 215, 190, 0.12)`,
    opacity: 0.4,
  },
  heroAccentRight: {
    position: "absolute",
    right: -100,
    bottom: 60,
    width: 280,
    height: 280,
    borderRadius: "50%",
    border: `1px solid rgba(193, 134, 59, 0.18)`,
    opacity: 0.5,
  },
  heroContent: {
    position: "relative",
    maxWidth: 820,
    margin: "0 auto",
    width: "100%",
    zIndex: 1,
  },
  eyebrow: {
    color: PALETTE.sand,
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 18,
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(48px, 8vw, 88px)",
    lineHeight: 1.02,
    fontWeight: 900,
    maxWidth: 780,
  },
  heroText: {
    margin: "24px 0 0",
    color: PALETTE.muted,
    fontSize: 18,
    lineHeight: 1.85,
    maxWidth: 700,
  },
  heroActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 34,
  },
  primaryCta: {
    minHeight: 56,
    padding: "0 28px",
    borderRadius: 999,
    border: "none",
    background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.saddle} 100%)`,
    color: PALETTE.textOnLight,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 18px 40px rgba(166,106,67,0.22)",
  },
  secondaryCta: {
    minHeight: 56,
    padding: "0 28px",
    borderRadius: 999,
    border: `1px solid rgba(231, 215, 190, 0.24)`,
    background: "rgba(255,255,255,0.04)",
    color: PALETTE.text,
    fontWeight: 800,
    cursor: "pointer",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginTop: 42,
    maxWidth: 760,
  },
  heroStat: {
    padding: "18px 20px",
    borderRadius: 22,
    background: "rgba(30,26,23,0.72)",
    border: `1px solid rgba(214,194,161,0.12)`,
    backdropFilter: "blur(6px)",
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: 800,
    color: PALETTE.text,
  },
  heroStatLabel: {
    marginTop: 6,
    color: PALETTE.muted,
    fontSize: 13,
  },
  shell: {
    maxWidth: 1380,
    margin: "-38px auto 0",
    padding: "0 20px",
    position: "relative",
    zIndex: 2,
  },
  stickyNavWrap: {
    position: "sticky",
    top: 112,
    zIndex: 20,
    marginBottom: 22,
  },
  stickyNav: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    padding: 12,
    borderRadius: 999,
    background: "rgba(30,26,23,0.92)",
    border: `1px solid rgba(214,194,161,0.12)`,
    backdropFilter: "blur(12px)",
    boxShadow: "0 18px 35px rgba(0,0,0,0.18)",
  },
  navPill: {
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    background: "transparent",
    color: PALETTE.muted,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 160ms ease, color 160ms ease, transform 160ms ease",
  },
  navPillActive: {
    background: `linear-gradient(135deg, rgba(193,134,59,0.24) 0%, rgba(139,94,60,0.24) 100%)`,
    color: PALETTE.text,
    transform: "translateY(-1px)",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: 24,
  },
  contentColumn: {
    display: "grid",
    gap: 28,
  },
  summaryAside: {
    position: "sticky",
    top: 188,
    alignSelf: "start",
  },
  summaryCard: {
    padding: 24,
    borderRadius: 28,
    background: `linear-gradient(180deg, ${PALETTE.surface} 0%, ${PALETTE.elevated} 100%)`,
    border: `1px solid rgba(214,194,161,0.12)`,
    boxShadow: "0 22px 50px rgba(0,0,0,0.24)",
  },
  summaryEyebrow: {
    color: PALETTE.gold,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: 800,
  },
  summaryTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 900,
  },
  summaryText: {
    color: PALETTE.muted,
    lineHeight: 1.75,
    margin: "12px 0 20px",
  },
  summaryMetrics: {
    display: "grid",
    gap: 12,
  },
  summaryMetric: {
    padding: "14px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(214,194,161,0.1)`,
  },
  summaryMetricLabel: {
    color: PALETTE.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  summaryMetricValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  summaryButton: {
    width: "100%",
    minHeight: 54,
    marginTop: 18,
    border: "none",
    borderRadius: 999,
    background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.saddle} 100%)`,
    color: PALETTE.textOnLight,
    fontWeight: 900,
    cursor: "pointer",
  },
  sectionCard: {
    padding: "30px 28px",
    borderRadius: 32,
    background: `linear-gradient(180deg, ${PALETTE.surface} 0%, ${PALETTE.elevated} 100%)`,
    border: `1px solid rgba(214,194,161,0.1)`,
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  },
  sectionHeader: {
    display: "grid",
    gridTemplateColumns: "80px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
    marginBottom: 24,
  },
  sectionRule: {
    height: 2,
    marginTop: 18,
    background: `linear-gradient(90deg, ${PALETTE.gold} 0%, rgba(193,134,59,0) 100%)`,
  },
  sectionEyebrow: {
    color: PALETTE.sand,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 38,
    lineHeight: 1.08,
    fontWeight: 900,
  },
  sectionSubtitle: {
    margin: "10px 0 0",
    color: PALETTE.muted,
    lineHeight: 1.8,
    maxWidth: 620,
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 18,
  },
  productCard: {
    borderRadius: 24,
    overflow: "hidden",
    background: "rgba(255,255,255,0.02)",
    border: `1px solid rgba(214,194,161,0.08)`,
    boxShadow: "0 18px 34px rgba(0,0,0,0.12)",
    transition: "transform 160ms ease, border-color 160ms ease, background 160ms ease",
  },
  productMedia: {
    position: "relative",
    aspectRatio: "1.45 / 1",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  priceTag: {
    position: "absolute",
    right: 14,
    bottom: 14,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(17,17,17,0.82)",
    color: PALETTE.text,
    fontWeight: 900,
    boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
  },
  productBody: {
    padding: 20,
  },
  productTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "start",
  },
  productTitle: {
    margin: 0,
    fontSize: 23,
    lineHeight: 1.18,
    fontWeight: 800,
    color: PALETTE.text,
  },
  allergenTag: {
    flexShrink: 0,
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(231,215,190,0.08)",
    color: PALETTE.sand,
    fontSize: 11,
    fontWeight: 700,
  },
  productDescription: {
    margin: "12px 0 0",
    color: PALETTE.muted,
    lineHeight: 1.7,
    minHeight: 54,
  },
  productMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
    color: PALETTE.sand,
    fontSize: 12,
    fontWeight: 700,
  },
  selectButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 20,
    border: "none",
    borderRadius: 999,
    background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.saddle} 100%)`,
    color: PALETTE.textOnLight,
    fontWeight: 900,
    cursor: "pointer",
  },
  drinksPanel: {
    display: "grid",
    gap: 18,
  },
  drinksInfo: {
    padding: "18px 20px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(214,194,161,0.08)`,
  },
  drinksEyebrow: {
    color: PALETTE.gold,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8,
  },
  drinksText: {
    margin: 0,
    color: PALETTE.muted,
    lineHeight: 1.75,
  },
  drinksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  drinkCard: {
    padding: "18px 18px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(214,194,161,0.08)`,
  },
  drinkName: {
    color: PALETTE.text,
    fontWeight: 700,
    lineHeight: 1.55,
  },
  drinkPrice: {
    marginTop: 8,
    color: PALETTE.gold,
    fontWeight: 900,
  },
  mobileSummaryBar: {
    position: "fixed",
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 60,
    borderRadius: 22,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    background: "rgba(30,26,23,0.95)",
    border: `1px solid rgba(214,194,161,0.12)`,
    boxShadow: "0 20px 38px rgba(0,0,0,0.25)",
    backdropFilter: "blur(12px)",
  },
  mobileSummaryLabel: {
    color: PALETTE.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  mobileSummaryValue: {
    color: PALETTE.text,
    fontWeight: 800,
    marginTop: 4,
  },
  mobileSummaryButton: {
    minHeight: 48,
    padding: "0 18px",
    border: "none",
    borderRadius: 999,
    background: `linear-gradient(135deg, ${PALETTE.gold} 0%, ${PALETTE.saddle} 100%)`,
    color: PALETTE.textOnLight,
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
  },
  footer: {
    textAlign: "center",
    color: PALETTE.muted,
    padding: "52px 20px 24px",
    fontSize: 14,
  },
  footerBrand: {
    display: "block",
    color: PALETTE.text,
    marginBottom: 8,
    letterSpacing: "0.08em",
  },
};

export default RestaurantPage;
