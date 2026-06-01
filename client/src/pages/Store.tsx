import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicHero from "../components/landing/DynamicHero";
import StripeTrustBand from "../components/landing/StripeTrustBand";
import LuxuryFooter from "../components/landing/LuxuryFooter";
import { Watch } from "../types";

interface StoreProps {
  watches: Watch[];
  addToCart: (watch: Watch) => void;
}

const BRAND_ICONS: Record<string, string> = {
  Seiko: "🇯🇵", Tissot: "🇨🇭", Hamilton: "⭐", Longines: "🏆",
  "TAG Heuer": "🏁", CITIZEN: "🌞", CASIO: "⚡", Swarovski: "💎",
  BERING: "❄️", Guess: "💫", Bulova: "🎖️", Fossil: "🦋",
  "Daniel Wellington": "🕐", Maserati: "🏎️", ORIENT: "🌏", Rado: "💿",
  Certina: "🔬", "Armani Exchange": "👔", "Michael Kors": "👜",
  MIDO: "⚙️", Nautica: "⚓", Diesel: "🔥", "Emporio Armani": "🎩", Junghans: "⏱️",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

function fixImageUrl(url: string | undefined): string {
  if (!url) return PLACEHOLDER;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}

type Gender = "all" | "herren" | "damen";

const GENDER_KEYWORDS: Record<Gender, string[]> = {
  all: [],
  herren: ["herren", "men", "gents", "man", "male"],
  damen: ["damen", "ladies", "lady", "women", "dame", "femme"],
};

// Collapsible sidebar group
const Group = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "0.5px solid #e5e0d8", paddingBottom: 12, marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: "none", border: "none", padding: "8px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: "0.73rem",
          letterSpacing: "0.12em", color: "#2a2a2a", cursor: "pointer",
        }}
      >
        {label.toUpperCase()}
        <span style={{ fontSize: "0.6rem", color: "#aaa" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ paddingTop: 6 }}>{children}</div>}
    </div>
  );
};

const Store = ({ watches, addToCart }: StoreProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const [activeBrand, setActiveBrand] = useState("all");
  const [gender, setGender] = useState<Gender>("all");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) setActiveBrand(cat);
    else setActiveBrand("all");
  }, [location.search]);

  // Brand groups sorted by count
  const brandGroups = useMemo(() => {
    const map = new Map<string, Watch[]>();
    for (const w of watches) {
      const b = (w.brand || "Other").trim();
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(w);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [watches]);

  const brands = useMemo(
    () => brandGroups.map(([b]) => b).slice().sort((a, b) => a.localeCompare(b)),
    [brandGroups]
  );

  // Apply all filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const genderKws = GENDER_KEYWORDS[gender];
    return watches.filter((w) => {
      const price = parseFloat(w.price) || 0;
      const hay = `${w.watch_name} ${w.brand} ${w.description ?? ""} ${w.model_code ?? ""}`.toLowerCase();
      if (activeBrand !== "all" && (w.brand || "").trim() !== activeBrand) return false;
      if (price > maxPrice) return false;
      if (q && !hay.includes(q)) return false;
      if (genderKws.length > 0 && !genderKws.some((kw) => hay.includes(kw))) return false;
      return true;
    });
  }, [watches, activeBrand, maxPrice, search, gender]);

  const isFiltering = activeBrand !== "all" || search !== "" || gender !== "all" || maxPrice < 1000;

  // For brand-grouped "all" view, apply price + gender + search filters
  const filteredBrandGroups = useMemo(() => {
    if (isFiltering) return [];
    return brandGroups;
  }, [brandGroups, isFiltering]);

  const handleReset = () => {
    setActiveBrand("all");
    setGender("all");
    setMaxPrice(1000);
    setSearch("");
    setSearchInput("");
  };

  const handleSearch = () => setSearch(searchInput);

  const sidebarLabel: Record<string, string> = {
    fontFamily: "'Jost', sans-serif", fontSize: "0.78rem",
    color: "#444", display: "flex", alignItems: "center", gap: 8,
    cursor: "pointer", padding: "3px 0",
  } as unknown as Record<string, string>;

  return (
    <main style={{ background: "#F9F9F7", color: "#1a1a1a", paddingTop: 136 }}>
      <DynamicHero />

      <div className="container-fluid px-3 px-md-4 py-4">
        <div className="row g-4">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="col-12 col-md-3 col-xl-2 d-none d-md-block">

            {/* Search */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Suchen..."
                  style={{
                    width: "100%", border: "0.5px solid #d5d0c8", borderRadius: 0,
                    padding: "8px 40px 8px 12px",
                    fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "#333",
                    background: "#fff", outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  style={{
                    position: "absolute", right: 0, top: 0, bottom: 0,
                    width: 36, background: "var(--brand-anthracite)", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Suchen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Marke */}
            <Group label="Marke">
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {["all", ...brands].map((b) => (
                  <label key={b} style={sidebarLabel as unknown as React.CSSProperties}>
                    <input
                      type="radio" name="brand" value={b}
                      checked={activeBrand === b}
                      onChange={() => setActiveBrand(b)}
                      style={{ accentColor: "var(--brand-gold)", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.78rem", fontFamily: "'Jost', sans-serif" }}>
                      {b === "all" ? "Alle Marken" : b}
                    </span>
                  </label>
                ))}
              </div>
            </Group>

            {/* Geschlecht */}
            <Group label="Geschlecht">
              {(["all", "herren", "damen"] as Gender[]).map((g) => (
                <label key={g} style={sidebarLabel as unknown as React.CSSProperties}>
                  <input
                    type="radio" name="gender" value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    style={{ accentColor: "var(--brand-gold)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.78rem", fontFamily: "'Jost', sans-serif" }}>
                    {g === "all" ? "Alle" : g === "herren" ? "Herren" : "Damen"}
                  </span>
                </label>
              ))}
            </Group>

            {/* Preis */}
            <Group label="Preis">
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 8 }}>
                  <span>€0</span>
                  <span style={{ color: "var(--brand-gold)", fontWeight: 500 }}>max €{maxPrice}</span>
                </div>
                <input
                  type="range" min={0} max={1000} step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--brand-gold)" }}
                />
              </div>
            </Group>

            {/* Reset */}
            {isFiltering && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  width: "100%", background: "none", border: "0.5px solid #ccc",
                  padding: "7px 0", fontFamily: "'Jost', sans-serif",
                  fontSize: "0.7rem", letterSpacing: "0.1em", color: "#999", cursor: "pointer",
                  marginTop: 4,
                }}
              >
                FILTER ZURÜCKSETZEN
              </button>
            )}
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="col-12 col-md-9 col-xl-10">

            {/* Filtered results */}
            {isFiltering ? (
              <div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "#888", marginBottom: 16 }}>
                  {filtered.length.toLocaleString("de-DE")} Artikel gefunden
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#bbb", padding: "60px 0", fontFamily: "'Jost', sans-serif" }}>
                    <div style={{ fontSize: "2rem" }}>⌚</div>
                    <p>Keine Uhren gefunden.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {filtered.map((watch) => {
                      const inStock = (watch.stock_quantity ?? 0) > 0;
                      return (
                        <div key={watch.watch_id} className="col-6 col-lg-4 col-xl-3">
                          <WatchCard watch={watch} addToCart={addToCart} inStock={inStock} navigate={navigate} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Brand-grouped view */
              <>
                {filteredBrandGroups.map(([brand, items]) => (
                  <div key={brand} className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, margin: 0, letterSpacing: "0.02em" }}>
                        {BRAND_ICONS[brand] ?? "🕐"} {brand}
                        <span style={{ fontSize: "0.72rem", color: "#aaa", marginLeft: 10, fontFamily: "'Jost', sans-serif", fontWeight: 400, verticalAlign: "middle" }}>
                          {items.length}
                        </span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveBrand(brand)}
                        style={{
                          background: "none", border: "0.5px solid #ccc",
                          padding: "4px 14px", fontFamily: "'Jost', sans-serif",
                          fontSize: "0.7rem", letterSpacing: "0.1em", color: "#666", cursor: "pointer",
                        }}
                      >
                        ALLE →
                      </button>
                    </div>
                    <div className="row g-3">
                      {items.slice(0, 6).map((watch) => {
                        const inStock = (watch.stock_quantity ?? 0) > 0;
                        return (
                          <div key={watch.watch_id} className="col-6 col-md-4 col-xl-2">
                            <WatchCard watch={watch} addToCart={addToCart} inStock={inStock} navigate={navigate} compact />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <StripeTrustBand />
      <LuxuryFooter />
    </main>
  );
};

// ── Shared mini card ──
function WatchCard({
  watch, addToCart, inStock, navigate, compact = false,
}: {
  watch: Watch; addToCart: (w: Watch) => void;
  inStock: boolean; navigate: (path: string) => void; compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const price = parseFloat(watch.price) || 0;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", border: "0.5px solid #e8e3db",
        boxShadow: hovered ? "0 6px 24px rgba(0,0,0,0.09)" : "none",
        transition: "box-shadow .2s", display: "flex", flexDirection: "column",
        opacity: inStock ? 1 : 0.8,
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/watch/${watch.watch_id}`)}
        style={{ border: "none", background: "#faf9f7", padding: compact ? 12 : 20, cursor: "pointer" }}
      >
        <img
          src={fixImageUrl(watch.image_url)}
          alt={watch.watch_name}
          loading="lazy"
          style={{
            width: "100%", maxHeight: compact ? 120 : 160, objectFit: "contain",
            transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform .25s",
            filter: watch.image_url ? "none" : "grayscale(30%)",
          }}
        />
      </button>
      <div style={{ padding: compact ? "8px 10px" : "12px 14px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", color: "var(--brand-gold)", letterSpacing: "0.12em", fontWeight: 500 }}>
          {watch.brand?.toUpperCase()}
        </span>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: compact ? "0.9rem" : "1rem", color: "#2a2a2a", lineHeight: 1.3, margin: "2px 0 4px" }}>
          {watch.model_code || watch.watch_name}
        </span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 6 }}>
          <strong style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem" }}>€{price.toFixed(2)}</strong>
          {inStock ? (
            <button
              type="button"
              onClick={() => addToCart(watch)}
              style={{
                background: hovered ? "var(--brand-gold)" : "var(--brand-anthracite)",
                color: "#fff", border: "none",
                padding: compact ? "4px 10px" : "5px 14px",
                fontFamily: "'Jost', sans-serif", fontSize: "0.62rem",
                letterSpacing: "0.1em", cursor: "pointer", transition: "background .2s",
              }}
            >
              + CART
            </button>
          ) : (
            <span style={{ fontSize: "0.62rem", color: "#ccc", fontFamily: "'Jost', sans-serif", letterSpacing: "0.08em" }}>BALD</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default Store;
