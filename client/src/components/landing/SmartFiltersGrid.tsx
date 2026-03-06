import React from "react";
import { useNavigate } from "react-router-dom";
import { Watch } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

function fixImageUrl(url: string | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

const copy = {
  en: {
    filtersTitle: "Popular Filters",
    searchPlaceholder: "Search by model or brand...",
    noResults: "No watches found for your current filters.",
    addToCart: "Add to Cart",
    showing: "Showing",
    items: "items",
    all: "All",
  },
  de: {
    filtersTitle: "Beliebte Filter",
    searchPlaceholder: "Nach Modell oder Marke suchen...",
    noResults: "Keine Uhren für die aktuellen Filter gefunden.",
    addToCart: "In den Warenkorb",
    showing: "Angezeigt",
    items: "Artikel",
    all: "Alle",
  },
} as const;

const FILTERS = [
  { key: "movement", value: "automatic", badge: "Automatic" },
  { key: "movement", value: "quartz", badge: "Quartz" },
  { key: "strap", value: "steel", badge: "Steel Strap" },
  { key: "strap", value: "leather", badge: "Leather Strap" },
  { key: "color", value: "black", badge: "Black Dial" },
  { key: "color", value: "blue", badge: "Blue Dial" },
] as const;

const SmartFiltersGrid = ({
  products,
  addToCart,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: {
  products: Watch[];
  addToCart: (watch: Watch) => void;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section id="catalog" className="container pb-5">
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: 0 }}>{t.filtersTitle}</h2>
        <div className="text-muted small">
          {t.showing} <strong>{products.length}</strong> {t.items}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm rounded-pill ${activeFilter === "all" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => onFilterChange("all")}
        >
          {t.all}
        </button>
        {FILTERS.map((f) => (
          <button
            key={`${f.key}:${f.value}`}
            type="button"
            className={`btn btn-sm rounded-pill ${activeFilter === f.value ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.badge}
          </button>
        ))}
      </div>

      <div className="position-relative mb-4" style={{ maxWidth: 420 }}>
        <input
          type="text"
          className="form-control rounded-pill ps-5 py-2"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="position-absolute top-50 start-0 translate-middle-y ms-3">🔍</span>
      </div>

      <div className="row g-4">
        {products.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">{t.noResults}</div>
        )}
        {products.map((watch) => (
          <div key={watch.watch_id} className="col-12 col-md-6 col-xl-4">
            <article className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <button
                type="button"
                className="border-0 bg-white p-4 text-center"
                onClick={() => navigate(`/watch/${watch.watch_id}`)}
              >
                <img
                  src={fixImageUrl(watch.image_url)}
                  alt={watch.watch_name}
                  className="img-fluid"
                  loading="lazy"
                  style={{ maxHeight: 220, objectFit: "contain" }}
                />
              </button>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between mb-2">
                  <span className="badge text-bg-light border">{watch.brand}</span>
                  <strong style={{ color: "#1a1a1a" }}>${watch.price}</strong>
                </div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem" }}>{watch.watch_name}</h3>
                <p className="text-muted small flex-grow-1">{watch.description}</p>
                <button
                  type="button"
                  className="btn rounded-pill mt-2"
                  style={{ background: "#1a1a1a", color: "#F9F9F7" }}
                  onClick={() => addToCart(watch)}
                >
                  {t.addToCart}
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SmartFiltersGrid;

