import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Watch } from "../types";
import { apiUrl } from "../config";
import PromoBanner from "../components/shop/PromoBanner";
import CategoryHeader from "../components/shop/CategoryHeader";
import BrandBar from "../components/shop/BrandBar";
import FilterSidebar, { ShopFilters } from "../components/shop/FilterSidebar";
import SortToolbar, { SortOption, ViewMode } from "../components/shop/SortToolbar";
import ProductCard from "../components/shop/ProductCard";
import Pagination from "../components/shop/Pagination";

interface WatchCategoryPageProps {
  addToCart: (watch: Watch) => void;
}

const PER_PAGE = 24;

const CATEGORY_LABELS: Record<string, string> = {
  automatic: "Automatik",
  chronograph: "Chronograph",
  diver: "Taucher",
  sport: "Sport",
  classic: "Klassik",
  luxury: "Luxus",
};

const WatchCategoryPage = ({ addToCart }: WatchCategoryPageProps) => {
  const [searchParams] = useSearchParams();

  const urlCategory = searchParams.get("category") || "";
  const urlBrand    = searchParams.get("brand")    || "";

  const [watches, setWatches] = useState<Watch[]>([]);
  const [total, setTotal]     = useState(0);
  const [brands, setBrands]   = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<ShopFilters>({
    brand: urlBrand || "all",
    priceMin: 0,
    priceMax: 2000,
    inStockOnly: false,
  });
  const [sort, setSort] = useState<SortOption>("relevanz");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  // Re-sync when URL params change (navbar navigation)
  useEffect(() => {
    setFilters((prev) => ({ ...prev, brand: urlBrand || "all" }));
    setPage(1);
  }, [urlCategory, urlBrand]);

  // Fetch brand list for sidebar (once per category change)
  useEffect(() => {
    const params = new URLSearchParams();
    if (urlCategory) params.set("category", urlCategory);
    fetch(apiUrl(`/api/v1/watches/brands?${params}`))
      .then((r) => r.json())
      .then((data: { brand: string; count: number }[]) =>
        setBrands(Array.isArray(data) ? data.map((d) => d.brand) : [])
      )
      .catch(console.error);
  }, [urlCategory]);

  // Fetch watches from server with all active filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
    if (urlCategory) params.set("category", urlCategory);

    const activeBrand = filters.brand !== "all" ? filters.brand : urlBrand;
    if (activeBrand) params.set("brand", activeBrand);

    if (filters.priceMin > 0)    params.set("min_price", String(filters.priceMin));
    if (filters.priceMax < 2000) params.set("max_price", String(filters.priceMax));
    if (filters.inStockOnly)     params.set("in_stock", "1");

    const sortParam = sort === "preis-asc"  ? "preis-asc"
                    : sort === "preis-desc" ? "preis-desc"
                    : sort === "name-az"    ? "name-az"
                    : "";
    if (sortParam) params.set("sort", sortParam);

    fetch(apiUrl(`/api/v1/watches?${params}`))
      .then((r) => r.json())
      .then((data: { watches: Watch[]; total: number }) => {
        setWatches(Array.isArray(data) ? data : data.watches ?? []);
        setTotal(typeof data.total === "number" ? data.total : 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, urlCategory, urlBrand, filters, sort]);

  const handleFilterChange = (f: ShopFilters) => { setFilters(f); setPage(1); };
  const handleBrandSelect  = (brand: string)  => { setFilters((p) => ({ ...p, brand })); setPage(1); };

  const pageTitle = urlBrand
    ? urlBrand
    : urlCategory
      ? (CATEGORY_LABELS[urlCategory] ?? urlCategory)
      : "Uhren";

  const breadcrumb = [
    { label: "Home", href: "/" },
    { label: "Uhren", href: "/uhren" },
    ...(urlCategory || urlBrand ? [{ label: pageTitle }] : []),
  ];

  return (
    <div style={{ background: "var(--brand-light)", minHeight: "100vh", paddingTop: 136 }}>
      <PromoBanner message="Kostenloser Versand ab €150 Bestellwert" code="GRATIS150" />

      <CategoryHeader
        title={pageTitle}
        subtitle="Entdecken Sie unsere exklusive Kollektion aus über 24 Marken"
        count={total}
        breadcrumb={breadcrumb}
      />

      <div className="container-fluid px-3 px-md-4 py-3">
        <BrandBar brands={brands} selected={filters.brand} onSelect={handleBrandSelect} />

        <div className="row g-4 mt-1">
          <div className="col-12 col-md-3 col-lg-2 d-none d-md-block">
            <FilterSidebar brands={brands} filters={filters} onChange={handleFilterChange} />
          </div>

          <div className="col-12 col-md-9 col-lg-10">
            <SortToolbar
              count={total}
              sort={sort}
              onSortChange={(s) => { setSort(s); setPage(1); }}
              view={view}
              onViewChange={setView}
            />

            {loading ? (
              <div
                className="d-flex align-items-center justify-content-center py-5"
                style={{ color: "#aaa", fontFamily: "'Jost', sans-serif" }}
              >
                Laden...
              </div>
            ) : watches.length === 0 ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center py-5"
                style={{ color: "#aaa", fontFamily: "'Jost', sans-serif", gap: 8 }}
              >
                <span style={{ fontSize: "2.5rem" }}>⌚</span>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Keine Artikel für diese Kategorie gefunden.
                </p>
                {urlCategory && (
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#ccc" }}>
                    Kategorie: {pageTitle} — Bitte zuerst die Migration ausführen.
                  </p>
                )}
              </div>
            ) : view === "list" ? (
              <div className="mt-3">
                {watches.map((w) => (
                  <ProductCard key={w.watch_id} watch={w} addToCart={addToCart} listView />
                ))}
              </div>
            ) : (
              <div className="row g-3 mt-1">
                {watches.map((w) => (
                  <div key={w.watch_id} className="col-6 col-lg-4 col-xl-3">
                    <ProductCard watch={w} addToCart={addToCart} />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              page={page}
              total={total}
              perPage={PER_PAGE}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchCategoryPage;
