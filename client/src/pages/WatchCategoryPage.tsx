import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Watch } from "../types";
import PromoBanner from "../components/shop/PromoBanner";
import CategoryHeader from "../components/shop/CategoryHeader";
import BrandBar from "../components/shop/BrandBar";
import FilterSidebar, { ShopFilters } from "../components/shop/FilterSidebar";
import SortToolbar, { SortOption, ViewMode } from "../components/shop/SortToolbar";
import ProductCard from "../components/shop/ProductCard";
import Pagination from "../components/shop/Pagination";

interface WatchCategoryPageProps {
  watches: Watch[];
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

const WatchCategoryPage = ({ watches, addToCart }: WatchCategoryPageProps) => {
  const [searchParams] = useSearchParams();

  // URL params set by Navbar category clicks
  const urlCategory = searchParams.get("category") || ""; // e.g. "automatic"
  const urlBrand    = searchParams.get("brand")    || ""; // e.g. "TAG Heuer"

  const [filters, setFilters] = useState<ShopFilters>({
    brand: urlBrand || "all",
    priceMin: 0,
    priceMax: 2000,
    inStockOnly: false,
  });
  const [sort, setSort]   = useState<SortOption>("relevanz");
  const [view, setView]   = useState<ViewMode>("grid");
  const [page, setPage]   = useState(1);

  // Re-sync whenever the user navigates to a different category via Navbar
  useEffect(() => {
    setFilters((prev) => ({ ...prev, brand: urlBrand || "all" }));
    setPage(1);
  }, [urlCategory, urlBrand]);

  // --- Unique brand list derived from the *currently visible* watches --------
  const brands = useMemo(() => {
    // When a category is active, only show brands present in that category
    const base = urlCategory
      ? watches.filter((w) => w.category === urlCategory)
      : watches;
    const map = new Map<string, number>();
    for (const w of base) {
      const b = (w.brand || "").trim();
      if (b) map.set(b, (map.get(b) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand);
  }, [watches, urlCategory]);

  // --- Filtering + sorting --------------------------------------------------
  const processed = useMemo(() => {
    let result = watches.filter((w) => {
      const price = parseFloat(w.price) || 0;
      const brand = (w.brand || "").trim();

      // Navbar category filter (uses DB category column)
      if (urlCategory && w.category !== urlCategory) return false;

      // Navbar brand filter (Luxus sub-brands)
      if (urlBrand && brand !== urlBrand) return false;

      // Sidebar brand filter
      if (filters.brand !== "all" && brand !== filters.brand) return false;

      // Price range
      if (price < filters.priceMin || price > filters.priceMax) return false;

      // In-stock only
      if (filters.inStockOnly && (w.stock_quantity ?? 0) === 0) return false;

      return true;
    });

    switch (sort) {
      case "preis-asc":
        result = result.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "preis-desc":
        result = result.slice().sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-az":
        result = result.slice().sort((a, b) => a.watch_name.localeCompare(b.watch_name));
        break;
    }

    return result;
  }, [watches, filters, sort, urlCategory, urlBrand]);

  // --- Pagination -----------------------------------------------------------
  const paginated = useMemo(
    () => processed.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [processed, page]
  );

  const handleFilterChange = (f: ShopFilters) => { setFilters(f); setPage(1); };
  const handleBrandSelect  = (brand: string)  => { setFilters((p) => ({ ...p, brand })); setPage(1); };

  // --- Page title -----------------------------------------------------------
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
        count={processed.length}
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
              count={processed.length}
              sort={sort}
              onSortChange={(s) => { setSort(s); setPage(1); }}
              view={view}
              onViewChange={setView}
            />

            {paginated.length === 0 ? (
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
                {paginated.map((w) => (
                  <ProductCard key={w.watch_id} watch={w} addToCart={addToCart} listView />
                ))}
              </div>
            ) : (
              <div className="row g-3 mt-1">
                {paginated.map((w) => (
                  <div key={w.watch_id} className="col-6 col-lg-4 col-xl-3">
                    <ProductCard watch={w} addToCart={addToCart} />
                  </div>
                ))}
              </div>
            )}

            <Pagination
              page={page}
              total={processed.length}
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
