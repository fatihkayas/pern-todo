interface BrandBarProps {
  brands: string[];
  selected: string;
  onSelect: (brand: string) => void;
}

const BrandBar = ({ brands, selected, onSelect }: BrandBarProps) => (
  <div
    className="d-flex gap-2 overflow-auto py-3"
    style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
  >
    <button
      type="button"
      onClick={() => onSelect("all")}
      style={{
        whiteSpace: "nowrap",
        border: selected === "all" ? "1px solid var(--brand-anthracite)" : "var(--border-luxury)",
        background: selected === "all" ? "var(--brand-anthracite)" : "#fff",
        color: selected === "all" ? "#fff" : "#555",
        borderRadius: "2px",
        padding: "5px 16px",
        fontSize: "0.72rem",
        letterSpacing: "0.1em",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      ALLE
    </button>

    {brands.map((brand) => (
      <button
        key={brand}
        type="button"
        onClick={() => onSelect(brand)}
        style={{
          whiteSpace: "nowrap",
          border: selected === brand ? "1px solid var(--brand-gold)" : "var(--border-luxury)",
          background: selected === brand ? "var(--brand-gold)" : "#fff",
          color: selected === brand ? "#fff" : "#555",
          borderRadius: "2px",
          padding: "5px 16px",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          fontFamily: "'Jost', sans-serif",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all .15s",
        }}
      >
        {brand.toUpperCase()}
      </button>
    ))}
  </div>
);

export default BrandBar;
