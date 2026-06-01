import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

interface NavbarProps {
  userDisplayName: string | null;
  cartCount: number;
  logout: () => void;
  onCartClick: () => void;
}

const WATCH_CATEGORIES: { label: string; category: string; sub?: string[] }[] = [
  { label: "Automatik",   category: "automatic" },
  { label: "Chronograph", category: "chronograph" },
  { label: "Taucher",     category: "diver" },
  { label: "Sport",       category: "sport" },
  { label: "Klassik",     category: "classic" },
  { label: "Luxus",       category: "luxury", sub: ["TAG Heuer", "Longines", "MIDO", "Gucci"] },
];

const Navbar = ({ userDisplayName, cartCount, logout, onCartClick }: NavbarProps) => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleCart = () => {
    if (!userDisplayName) { navigate("/login"); return; }
    onCartClick();
  };

  const navLinkStyle = (path: string) => ({
    fontFamily: "'Jost', sans-serif",
    fontWeight: 400,
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    textDecoration: "none",
    color: isActive(path) ? "var(--brand-gold)" : "var(--brand-anthracite)",
    borderBottom: isActive(path) ? "1px solid var(--brand-gold)" : "1px solid transparent",
    paddingBottom: 2,
    transition: "color .15s",
  });

  return (
    <header
      className="fixed-top"
      style={{ background: "#fff", borderBottom: "var(--border-luxury)", zIndex: 1000 }}
    >
      {/* Top utility bar */}
      <div
        style={{
          background: "var(--brand-anthracite)",
          color: "#ccc",
          fontSize: "0.68rem",
          letterSpacing: "0.1em",
          fontFamily: "'Jost', sans-serif",
          padding: "6px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>KOSTENLOSER VERSAND AB €150</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button
            onClick={() => setLanguage("en")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: language === "en" ? "#fff" : "#888",
              fontSize: "0.68rem", letterSpacing: "0.1em", fontFamily: "inherit",
              padding: 0,
            }}
          >EN</button>
          <span style={{ color: "#555" }}>|</span>
          <button
            onClick={() => setLanguage("de")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: language === "de" ? "#fff" : "#888",
              fontSize: "0.68rem", letterSpacing: "0.1em", fontFamily: "inherit",
              padding: 0,
            }}
          >DE</button>
        </div>
      </div>

      {/* Main nav */}
      <div
        style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1.55rem",
            fontWeight: 500,
            letterSpacing: "0.18em",
            color: "var(--brand-anthracite)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Ranch Watches
        </Link>

        {/* Center nav links — desktop */}
        <nav className="d-none d-lg-flex" style={{ gap: 36 }}>
          <Link to="/" style={navLinkStyle("/")}>
            {language === "de" ? "SHOP" : "SHOP"}
          </Link>
          <Link to="/uhren" style={navLinkStyle("/uhren")}>
            {language === "de" ? "UHREN" : "WATCHES"}
          </Link>
          <Link to="/about" style={navLinkStyle("/about")}>
            {language === "de" ? "ÜBER UNS" : "ABOUT"}
          </Link>
          <Link to="/contact" style={navLinkStyle("/contact")}>
            {language === "de" ? "KONTAKT" : "CONTACT"}
          </Link>
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* User */}
          {userDisplayName ? (
            <>
              <Link
                to="/orders"
                style={{ ...navLinkStyle("/orders"), display: "none" }}
                className="d-none d-md-inline"
              >
                {userDisplayName.split(" ")[0].toUpperCase()}
              </Link>
              <button
                onClick={logout}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Jost', sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.1em", color: "#aaa",
                }}
                className="d-none d-md-inline"
              >
                {language === "de" ? "ABMELDEN" : "LOGOUT"}
              </button>
            </>
          ) : (
            <div className="d-none d-md-flex" style={{ gap: 12 }}>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Jost', sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.1em", color: "#777", textDecoration: "none",
                }}
              >
                {language === "de" ? "ANMELDEN" : "LOGIN"}
              </Link>
              <Link
                to="/register"
                style={{
                  fontFamily: "'Jost', sans-serif", fontSize: "0.72rem",
                  letterSpacing: "0.1em",
                  color: "#fff",
                  background: "var(--brand-anthracite)",
                  padding: "5px 16px",
                  textDecoration: "none",
                }}
              >
                {language === "de" ? "REGISTRIEREN" : "SIGN UP"}
              </Link>
            </div>
          )}

          {/* Cart */}
          <button
            onClick={handleCart}
            style={{
              background: "none", border: "none", cursor: "pointer",
              position: "relative", padding: 0,
            }}
            aria-label="Cart"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-anthracite)" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute", top: -6, right: -8,
                  background: "var(--brand-gold)", color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: "0.6rem", display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: "'Jost', sans-serif",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="d-lg-none"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-anthracite)" strokeWidth="1.5">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Category bar — desktop */}
      <div
        className="d-none d-md-flex"
        style={{
          borderTop: "var(--border-luxury)",
          justifyContent: "center",
          gap: 40,
          padding: "10px 24px",
          background: "#fafaf8",
        }}
      >
        {WATCH_CATEGORIES.map((cat) => (
          <div key={cat.label} style={{ position: "relative" }} className="cat-item">
            <Link
              to={`/uhren?category=${cat.category}`}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                color: "#666",
                textDecoration: "none",
                transition: "color .15s",
                display: "block",
                padding: "2px 0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
            >
              {cat.label.toUpperCase()}
            </Link>
            {/* Luxus dropdown */}
            {cat.sub && (
              <div
                className="cat-dropdown"
                style={{
                  display: "none",
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fff",
                  border: "var(--border-luxury)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  minWidth: 160,
                  zIndex: 200,
                  padding: "8px 0",
                }}
              >
                {cat.sub.map((brand) => (
                  <Link
                    key={brand}
                    to={`/uhren?brand=${encodeURIComponent(brand)}`}
                    style={{
                      display: "block",
                      padding: "7px 20px",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      color: "#555",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--brand-gold)";
                      e.currentTarget.style.background = "#faf9f7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#555";
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .cat-item:hover .cat-dropdown { display: block !important; }
      `}</style>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "#fff",
            borderTop: "var(--border-luxury)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            { label: language === "de" ? "SHOP" : "SHOP", path: "/" },
            { label: language === "de" ? "UHREN" : "WATCHES", path: "/uhren" },
            { label: language === "de" ? "ÜBER UNS" : "ABOUT", path: "/about" },
            { label: language === "de" ? "KONTAKT" : "CONTACT", path: "/contact" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                color: "var(--brand-anthracite)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
          {!userDisplayName && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", letterSpacing: "0.1em", color: "#888", textDecoration: "none" }}>
                {language === "de" ? "ANMELDEN" : "LOGIN"}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", letterSpacing: "0.1em", color: "#888", textDecoration: "none" }}>
                {language === "de" ? "REGISTRIEREN" : "SIGN UP"}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
