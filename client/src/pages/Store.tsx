import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicHero from "../components/landing/DynamicHero";
import CircularCategoryBar, { CategoryItem } from "../components/landing/CircularCategoryBar";
import SmartFiltersGrid from "../components/landing/SmartFiltersGrid";
import StripeTrustBand from "../components/landing/StripeTrustBand";
import LuxuryFooter from "../components/landing/LuxuryFooter";
import { Watch } from "../types";

interface StoreProps {
  watches: Watch[];
  addToCart: (watch: Watch) => void;
}

const BRAND_ICONS: Record<string, string> = {
  Seiko: "🇯🇵",
  Tissot: "🇨🇭",
  Hamilton: "⭐",
  Longines: "🏆",
  "TAG Heuer": "🏁",
  CITIZEN: "🌞",
  CASIO: "⚡",
  Swarovski: "💎",
  BERING: "❄️",
  Guess: "💫",
  Bulova: "🎖️",
  Fossil: "🦋",
  "Daniel Wellington": "🕐",
  Maserati: "🏎️",
  ORIENT: "🌏",
  Rado: "💿",
  Certina: "🔬",
  "Armani Exchange": "👔",
  "Michael Kors": "👜",
  MIDO: "⚙️",
  Nautica: "⚓",
  Diesel: "🔥",
  "Emporio Armani": "🎩",
  Junghans: "⏱️",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

function fixImageUrl(url: string | undefined): string {
  if (!url) return PLACEHOLDER;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

const Store = ({ watches, addToCart }: StoreProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) setActiveCategory(cat);
    else setActiveCategory("all");
  }, [location.search]);

  // Group watches by brand, sorted by count descending
  const brandGroups = useMemo(() => {
    const map = new Map<string, Watch[]>();
    for (const w of watches) {
      const b = (w.brand || "Other").trim();
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(w);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [watches]);

  // Dynamic category bar: All + every brand
  const categories: CategoryItem[] = useMemo(
    () => [
      { id: "all", icon: "⌚", color: "#1a1a1a" },
      ...brandGroups.map(([brand]) => ({
        id: brand,
        icon: BRAND_ICONS[brand] ?? "🕐",
        color: "#495057",
      })),
    ],
    [brandGroups]
  );

  const isSearching = search.trim().length > 0 || activeFilter !== "all";

  // Filtered watches for search / filter mode
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return watches.filter((w) => {
      const hay = `${w.watch_name} ${w.brand} ${w.description ?? ""} ${w.model_code ?? ""}`.toLowerCase();
      const matchSearch = !q || hay.includes(q);
      const matchCategory =
        activeCategory === "all" || (w.brand || "").trim() === activeCategory;
      const matchFilter = activeFilter === "all" || hay.includes(activeFilter.toLowerCase());
      return matchSearch && matchCategory && matchFilter;
    });
  }, [watches, search, activeCategory, activeFilter]);

  // Watches for a single selected brand (all items)
  const brandFiltered = useMemo(
    () =>
      activeCategory !== "all"
        ? brandGroups.find(([b]) => b === activeCategory)?.[1] ?? []
        : [],
    [activeCategory, brandGroups]
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearch("");
    setActiveFilter("all");
  };

  return (
    <main style={{ background: "#F9F9F7", color: "#1a1a1a" }}>
      <DynamicHero />
      <CircularCategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* Search + filter mode OR single brand view */}
      {(isSearching || activeCategory !== "all") && (
        <SmartFiltersGrid
          products={isSearching ? filtered : brandFiltered}
          addToCart={addToCart}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {/* All-brands grouped view */}
      {!isSearching && activeCategory === "all" && (
        <section className="container pb-5">
          {/* Search bar always visible */}
          <div className="position-relative mb-5" style={{ maxWidth: 420 }}>
            <input
              type="text"
              className="form-control rounded-pill ps-5 py-2"
              placeholder="Search by model or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3">🔍</span>
          </div>

          {brandGroups.map(([brand, items]) => (
            <div key={brand} className="mb-5">
              {/* Brand header */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "1.6rem",
                    margin: 0,
                    letterSpacing: "0.02em",
                  }}
                >
                  {BRAND_ICONS[brand] ?? "🕐"} {brand}
                  <span
                    className="ms-2 badge text-bg-light border"
                    style={{ fontSize: "0.75rem", verticalAlign: "middle" }}
                  >
                    {items.length}
                  </span>
                </h2>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark rounded-pill"
                  onClick={() => handleCategoryChange(brand)}
                >
                  View all →
                </button>
              </div>

              {/* First 6 watches */}
              <div className="row g-3">
                {items.slice(0, 6).map((watch) => {
                  const hasImage = Boolean(watch.image_url);
                  const inStock = (watch.stock_quantity ?? 0) > 0;
                  return (
                    <div key={watch.watch_id} className="col-6 col-md-4 col-xl-2">
                      <article
                        className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                        style={{ opacity: inStock ? 1 : 0.75 }}
                      >
                        <button
                          type="button"
                          className="border-0 bg-white p-3 text-center"
                          onClick={() => navigate(`/watch/${watch.watch_id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={fixImageUrl(watch.image_url)}
                            alt={watch.watch_name}
                            className="img-fluid"
                            loading="lazy"
                            style={{
                              maxHeight: 140,
                              objectFit: "contain",
                              filter: hasImage ? "none" : "grayscale(40%)",
                            }}
                          />
                        </button>
                        <div className="card-body d-flex flex-column p-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                              {watch.model_code}
                            </span>
                            <strong style={{ fontSize: "0.85rem" }}>€{watch.price}</strong>
                          </div>
                          {inStock ? (
                            <button
                              type="button"
                              className="btn btn-sm rounded-pill mt-auto"
                              style={{ background: "#1a1a1a", color: "#F9F9F7", fontSize: "0.75rem" }}
                              onClick={() => addToCart(watch)}
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <span
                              className="btn btn-sm rounded-pill mt-auto disabled"
                              style={{ background: "#e9ecef", color: "#6c757d", fontSize: "0.75rem" }}
                            >
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      <StripeTrustBand />
      <LuxuryFooter />
    </main>
  );
};

export default Store;
