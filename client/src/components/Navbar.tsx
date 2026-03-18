import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { IS_PIZZA, SHOP } from "../config/branding";

interface NavbarProps {
  userDisplayName: string | null;
  cartCount: number;
  logout: () => void;
  onCartClick: () => void;
}

const copy = {
  en: {
    promo: "15% off all Seiko models | Free Shipping",
    support: "Customer Support: 0850 ...",
    store: "Store",
    about: "About",
    contact: "Contact",
    brands: "Brands",
    automatic: "Automatic",
    sport: "Sport",
    classic: "Classic",
    deals: "Deals",
    account: "My Account",
    logout: "Logout",
    login: "Login",
    register: "Sign Up",
  },
  de: {
    promo: "15% Rabatt auf alle Seiko-Modelle | Kostenloser Versand",
    support: "Kundendienst: 0850 ...",
    store: "Shop",
    about: "Uber Uns",
    contact: "Kontakt",
    brands: "Marken",
    automatic: "Automatik",
    sport: "Sport",
    classic: "Klassisch",
    deals: "Angebote",
    account: "Mein Konto",
    logout: "Abmelden",
    login: "Anmelden",
    register: "Registrieren",
  },
} as const;

const Navbar = ({ userDisplayName, cartCount, logout, onCartClick }: NavbarProps) => {
  const { isDark, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = copy[language];

  const handleCart = () => {
    if (!userDisplayName) {
      navigate("/login");
      return;
    }
    onCartClick();
  };

  if (IS_PIZZA) {
    return (
      <header className="fixed-top shadow-sm">
        <div
          className="text-white py-2 px-4 d-flex justify-content-between align-items-center small"
          style={{ letterSpacing: "0.08em", background: "#1b1212", borderBottom: "1px solid #332020" }}
        >
          <div>{SHOP.tagline}</div>
          <div className="d-flex gap-3 align-items-center">
            <span>DE / EN</span>
            <span>Lieferung ab 20 Min.</span>
          </div>
        </div>

        <nav className="navbar p-3" style={{ background: "rgba(10, 10, 10, 0.95)", backdropFilter: "blur(14px)" }}>
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <Link className="navbar-brand fw-bold fs-4 m-0 text-white" to="/" style={{ letterSpacing: "0.08em" }}>
              PIZZA & DONER HAUS
            </Link>

            <div className="d-none d-lg-flex gap-4">
              <a className="nav-link fw-semibold text-uppercase small text-white" href="#menu">Menu</a>
              <a className="nav-link fw-semibold text-uppercase small text-white" href="#pizza">Pizza</a>
              <a className="nav-link fw-semibold text-uppercase small text-white" href="#doner">Doner</a>
              <a className="nav-link fw-semibold text-uppercase small text-white" href="#order">Bestellen</a>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="btn-group btn-group-sm" role="group" aria-label="Language selector">
                <button
                  type="button"
                  className={`btn ${language === "en" ? "btn-light" : "btn-outline-light"}`}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={`btn ${language === "de" ? "btn-light" : "btn-outline-light"}`}
                  onClick={() => setLanguage("de")}
                >
                  DE
                </button>
              </div>

              <button className="btn btn-link p-0 text-white" onClick={toggle} style={{ fontSize: "1.2rem" }}>
                {isDark ? "Sun" : "Moon"}
              </button>

              <div className="position-relative text-white" style={{ cursor: "pointer" }} onClick={handleCart}>
                <span style={{ fontSize: "1.4rem" }}>Cart</span>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed-top shadow-sm">
      <div
        className="text-white py-2 px-4 d-flex justify-content-between align-items-center small fw-light"
        style={{ letterSpacing: "0.05em", background: "#212529" }}
      >
        <div>{t.promo}</div>
        <div className="d-flex gap-3 align-items-center">
          <span>EN / DE</span>
          <span>{t.support}</span>
        </div>
      </div>

      <nav className={`navbar p-3 ${isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"}`}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link className="navbar-brand fw-bold fs-4 mx-auto mx-lg-0" to="/" style={{ letterSpacing: "0.1em" }}>
            SEIKO & TISSOT STORE
          </Link>

          <div className="d-none d-lg-flex gap-4">
            <Link className="nav-link fw-semibold text-uppercase small" to="/">{t.store}</Link>
            <Link className="nav-link fw-semibold text-uppercase small" to="/about">{t.about}</Link>
            <Link className="nav-link fw-semibold text-uppercase small" to="/contact">{t.contact}</Link>
            <div className="nav-item dropdown">
              <button
                className="btn nav-link fw-bold text-primary text-uppercase small dropdown-toggle p-0 border-0 bg-transparent"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {t.brands}
              </button>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/?cat=Seiko">Seiko</Link></li>
                <li><Link className="dropdown-item" to="/?cat=Tissot">Tissot</Link></li>
              </ul>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="btn-group btn-group-sm" role="group" aria-label="Language selector">
              <button
                type="button"
                className={`btn ${language === "en" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`btn ${language === "de" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setLanguage("de")}
              >
                DE
              </button>
            </div>

            <button className="btn btn-link p-0" onClick={toggle} style={{ fontSize: "1.2rem" }}>
              {isDark ? "Sun" : "Moon"}
            </button>

            <div className="position-relative" style={{ cursor: "pointer" }} onClick={handleCart}>
              <span style={{ fontSize: "1.5rem" }}>Cart</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary border border-white">
                  {cartCount}
                </span>
              )}
            </div>

            {userDisplayName ? (
              <div className="d-flex align-items-center gap-2 border-start ps-3">
                <span className="small d-none d-md-inline fw-medium">{userDisplayName}</span>
                <Link to="/orders" className="btn btn-sm btn-outline-dark rounded-0 px-3">{t.account}</Link>
                <button className="btn btn-sm btn-link text-danger text-decoration-none" onClick={logout}>{t.logout}</button>
              </div>
            ) : (
              <div className="d-flex gap-2 border-start ps-3">
                <Link to="/login" className="btn btn-sm btn-outline-dark rounded-0 px-3">{t.login}</Link>
                <Link to="/register" className="btn btn-sm btn-dark rounded-0 px-3">{t.register}</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={`py-2 border-top border-bottom d-none d-md-block ${isDark ? "bg-dark border-secondary" : "bg-light border-light"}`}>
        <div className="container-fluid d-flex justify-content-center gap-5 small fw-bold text-uppercase" style={{ letterSpacing: "0.1em" }}>
          <Link to="/?cat=Seiko" className="nav-link text-muted">Seiko</Link>
          <Link to="/?cat=Tissot" className="nav-link text-muted">Tissot</Link>
          <Link to="/?cat=Automatic" className="nav-link text-muted">{t.automatic}</Link>
          <Link to="/?cat=Sport" className="nav-link text-muted">{t.sport}</Link>
          <Link to="/?cat=Classic" className="nav-link text-muted">{t.classic}</Link>
          <Link to="/?cat=all" className="nav-link text-danger">{t.deals}</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
