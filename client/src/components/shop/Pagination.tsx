interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

const Pagination = ({ page, total, perPage, onChange }: PaginationProps) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btn = (
    label: string | number,
    target: number | null,
    active = false,
    disabled = false
  ) => (
    <button
      key={label}
      type="button"
      disabled={disabled || target === null}
      onClick={() => target !== null && onChange(target)}
      style={{
        minWidth: 36,
        height: 36,
        border: active ? "1px solid var(--brand-anthracite)" : "var(--border-luxury)",
        background: active ? "var(--brand-anthracite)" : "#fff",
        color: active ? "#fff" : disabled ? "#ccc" : "var(--brand-anthracite)",
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.78rem",
        cursor: disabled || target === null ? "default" : "pointer",
        padding: "0 4px",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="d-flex align-items-center justify-content-center gap-1 py-4">
      {btn("‹", page > 1 ? page - 1 : null, false, page === 1)}
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#aaa" }}>…</span>
          : btn(p, p as number, p === page)
      )}
      {btn("›", page < totalPages ? page + 1 : null, false, page === totalPages)}
    </div>
  );
};

export default Pagination;
