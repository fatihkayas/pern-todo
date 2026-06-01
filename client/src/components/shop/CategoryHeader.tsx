import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CategoryHeaderProps {
  title: string;
  subtitle?: string;
  count: number;
  breadcrumb: BreadcrumbItem[];
}

const CategoryHeader = ({ title, subtitle, count, breadcrumb }: CategoryHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "var(--brand-light)",
        borderBottom: "var(--border-luxury)",
        paddingTop: "2rem",
        paddingBottom: "1.5rem",
      }}
      className="px-3 px-md-4"
    >
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb mb-0" style={{ fontSize: "0.72rem", letterSpacing: "0.06em" }}>
          {breadcrumb.map((item, i) => (
            <li
              key={i}
              className={`breadcrumb-item${i === breadcrumb.length - 1 ? " active" : ""}`}
              style={{ color: i === breadcrumb.length - 1 ? "#888" : undefined }}
            >
              {item.href ? (
                <button
                  onClick={() => navigate(item.href!)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--brand-anthracite)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "inherit",
                    letterSpacing: "inherit",
                  }}
                >
                  {item.label}
                </button>
              ) : (
                item.label
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Title row */}
      <div className="d-flex align-items-baseline gap-3 flex-wrap">
        <h1
          className="shop-serif mb-0"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, letterSpacing: "0.01em" }}
        >
          {title}
        </h1>
        <span style={{ color: "#999", fontSize: "0.8rem", fontFamily: "'Jost', sans-serif" }}>
          {count.toLocaleString("de-DE")} Artikel
        </span>
      </div>

      {subtitle && (
        <p
          className="mt-2 mb-0"
          style={{ color: "#777", fontSize: "0.9rem", fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default CategoryHeader;
