import { useMemo, useState } from "react";
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

const WatchCategoryPage = ({ watches, addToCart }: WatchCategoryPageProps) => {
  const [filters, setFilters] = useState<ShopFilters>({
    brand: "all",
    priceMin: 0,
    priceMax: 1000,
    inStockOnly: false,
  });
  const [sort, setSort] = useState<SortOption>("relevanz");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  // Sorted unique brand list
  const brands = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of watches) {
      const b = (w.brand || "").trim();
      if (b) map.set(b, (map.get(b) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand);
  }, [watches]);

  // Filtered + sorted
  const processed = useMemo(() => {
    let result = watches.filter((w) => {
      const price = parseFloat(w.price) || 0;
      const brand = (w.brand || "").trim();
      if (filters.brand !== "all" && brand !== filters.brand) return false;
      if (price < filters.priceMin || price > filters.priceMax) return false;
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
  }, [watches, filters, sort]);

  // Paginated slice
  const paginated = useMemo(
    () => processed.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [processed, page]
  );

  const handleFilterChange = (f: ShopFilters) => {
    setFilters(f);
    setPage(1);
  };

  const handleBrandSelect = (brand: string) => {
    setFilters((prev) => ({ ...prev, brand }));
    setPage(1);
  };

  return (
    <div style={{ background: "var(--brand-light)", minHeight: "100vh", paddingTop: 136 }}>
      <PromoBanner
        message="Kostenloser Versand ab €150 Bestellwert"
        code="GRATIS150"
      />

      <CategoryHeader
        title="Uhren"
        subtitle="Entdecken Sie unsere exklusive Kollektion aus über 24 Marken"
        count={processed.length}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Uhren" },
        ]}
      />

      <div className="container-fluid px-3 px-md-4 py-3">
        {/* Brand bar */}
        <BrandBar
          brands={brands}
          selected={filters.brand}
          onSelect={handleBrandSelect}
        />

        <div className="row g-4 mt-1">
          {/* Sidebar — hidden on mobile */}
          <div className="col-12 col-md-3 col-lg-2 d-none d-md-block">
            <FilterSidebar
              brands={brands}
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>

          {/* Main */}
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
                style={{ color: "#aaa", fontFamily: "'Jost', sans-serif" }}
              >
                <span style={{ fontSize: "2rem" }}>⌚</span>
                <p className="mt-2 mb-0">Keine Artikel für diese Filter gefunden.</p>
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
