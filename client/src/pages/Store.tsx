import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DynamicHero from "../components/landing/DynamicHero";
import CircularCategoryBar, { CategoryItem } from "../components/landing/CircularCategoryBar";
import SmartFiltersGrid from "../components/landing/SmartFiltersGrid";
import StripeTrustBand from "../components/landing/StripeTrustBand";
import PerformanceMetricsPanel from "../components/landing/PerformanceMetricsPanel";
import LuxuryFooter from "../components/landing/LuxuryFooter";
import { Watch } from "../types";

interface StoreProps {
  watches: Watch[];
  addToCart: (watch: Watch) => void;
}

const CATEGORIES: CategoryItem[] = [
  { id: "all", icon: "⌚", color: "#1a1a1a" },
  { id: "Seiko", icon: "🇯🇵", color: "#003087" },
  { id: "Tissot", icon: "🇨🇭", color: "#FF0000" },
  { id: "Automatic", icon: "⚙️", color: "#D4AF37" },
  { id: "Sport", icon: "🌊", color: "#0056b3" },
  { id: "Classic", icon: "👔", color: "#495057" },
];

const Store = ({ watches, addToCart }: StoreProps) => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) setActiveCategory(cat);
    else setActiveCategory("all");
  }, [location.search]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return watches.filter((w) => {
      const haystack = `${w.watch_name} ${w.brand} ${w.description || ""} ${w.model_code || ""}`.toLowerCase();

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesCategory =
        activeCategory === "all" ||
        w.brand === activeCategory ||
        (w.description || "").toLowerCase().includes(activeCategory.toLowerCase());

      const matchesPopularFilter =
        activeFilter === "all" || haystack.includes(activeFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesPopularFilter;
    });
  }, [watches, search, activeCategory, activeFilter]);

  return (
    <main style={{ background: "#F9F9F7", color: "#1a1a1a" }}>
      <DynamicHero />
      <CircularCategoryBar
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      <SmartFiltersGrid
        products={filtered}
        addToCart={addToCart}
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <StripeTrustBand />
      <PerformanceMetricsPanel watches={watches} />
      <LuxuryFooter />
    </main>
  );
};

export default Store;

