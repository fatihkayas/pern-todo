export type SortOption = "relevanz" | "preis-asc" | "preis-desc" | "name-az";
export type ViewMode = "grid" | "list";

interface SortToolbarProps {
  count: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevanz", label: "Relevanz" },
  { value: "preis-asc", label: "Preis aufsteigend" },
  { value: "preis-desc", label: "Preis absteigend" },
  { value: "name-az", label: "Name A–Z" },
];

const SortToolbar = ({ count, sort, onSortChange, view, onViewChange }: SortToolbarProps) => (
  <div
    className="d-flex align-items-center justify-content-between py-2"
    style={{ borderBottom: "var(--border-luxury)", fontFamily: "'Jost', sans-serif" }}
  >
    <span style={{ fontSize: "0.78rem", color: "#888" }}>
      {count.toLocaleString("de-DE")} Artikel
    </span>

    <div className="d-flex align-items-center gap-3">
      {/* Sort */}
      <div className="d-flex align-items-center gap-2">
        <label style={{ fontSize: "0.72rem", letterSpacing: "0.08em", color: "#888" }}>
          SORTIEREN
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          style={{
            border: "var(--border-luxury)",
            borderRadius: 0,
            padding: "4px 8px",
            fontSize: "0.78rem",
            fontFamily: "'Jost', sans-serif",
            color: "var(--brand-anthracite)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* View toggle */}
      <div className="d-flex" style={{ border: "var(--border-luxury)" }}>
        {(["grid", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            title={v === "grid" ? "Gitteransicht" : "Listenansicht"}
            style={{
              background: view === v ? "var(--brand-anthracite)" : "#fff",
              color: view === v ? "#fff" : "#999",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: "0.85rem",
              lineHeight: 1,
            }}
          >
            {v === "grid" ? "⊞" : "☰"}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SortToolbar;
