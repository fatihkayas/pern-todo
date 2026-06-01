import { useState } from "react";

export interface ShopFilters {
  brand: string;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  brands: string[];
  filters: ShopFilters;
  onChange: (filters: ShopFilters) => void;
}

const PRICE_MAX = 1000;

const GroupHeader = ({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="d-flex align-items-center justify-content-between w-100"
    style={{
      background: "none",
      border: "none",
      borderBottom: "var(--border-luxury)",
      padding: "12px 0",
      cursor: "pointer",
      fontFamily: "'Jost', sans-serif",
      fontWeight: 500,
      fontSize: "0.78rem",
      letterSpacing: "0.1em",
      color: "var(--brand-anthracite)",
    }}
  >
    {label.toUpperCase()}
    <span style={{ fontSize: "0.65rem", color: "#999" }}>{open ? "▲" : "▼"}</span>
  </button>
);

const FilterSidebar = ({ brands, filters, onChange }: FilterSidebarProps) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    brand: true,
    price: true,
    stock: true,
  });

  const toggle = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const set = (patch: Partial<ShopFilters>) => onChange({ ...filters, ...patch });

  return (
    <aside style={{ fontFamily: "'Jost', sans-serif" }}>
      {/* Brand */}
      <GroupHeader label="Marke" open={openGroups.brand} onToggle={() => toggle("brand")} />
      {openGroups.brand && (
        <div className="py-2" style={{ maxHeight: 260, overflowY: "auto" }}>
          {["all", ...brands].map((b) => (
            <label
              key={b}
              className="d-flex align-items-center gap-2 py-1"
              style={{ cursor: "pointer", fontSize: "0.8rem", color: "#444" }}
            >
              <input
                type="radio"
                name="brand"
                checked={filters.brand === b}
                onChange={() => set({ brand: b })}
                style={{ accentColor: "var(--brand-gold)" }}
              />
              {b === "all" ? "Alle Marken" : b}
            </label>
          ))}
        </div>
      )}

      {/* Price */}
      <GroupHeader label="Preis" open={openGroups.price} onToggle={() => toggle("price")} />
      {openGroups.price && (
        <div className="py-3">
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.75rem", color: "#666" }}>
            <span>€{filters.priceMin}</span>
            <span>€{filters.priceMax}</span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            value={filters.priceMax}
            onChange={(e) => set({ priceMax: Number(e.target.value) })}
            className="w-100"
            style={{ accentColor: "var(--brand-gold)" }}
          />
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            value={filters.priceMin}
            onChange={(e) =>
              set({ priceMin: Math.min(Number(e.target.value), filters.priceMax - 1) })
            }
            className="w-100 mt-1"
            style={{ accentColor: "var(--brand-gold)" }}
          />
        </div>
      )}

      {/* Stock */}
      <GroupHeader label="Verfügbarkeit" open={openGroups.stock} onToggle={() => toggle("stock")} />
      {openGroups.stock && (
        <div className="py-2">
          <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer", fontSize: "0.8rem", color: "#444" }}>
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => set({ inStockOnly: e.target.checked })}
              style={{ accentColor: "var(--brand-gold)" }}
            />
            Nur verfügbare Artikel
          </label>
        </div>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={() => onChange({ brand: "all", priceMin: 0, priceMax: PRICE_MAX, inStockOnly: false })}
        className="mt-3 w-100"
        style={{
          background: "none",
          border: "var(--border-luxury)",
          padding: "8px",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          cursor: "pointer",
          color: "#888",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        FILTER ZURÜCKSETZEN
      </button>
    </aside>
  );
};

export default FilterSidebar;
