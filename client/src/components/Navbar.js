import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ userDisplayName, cartCount, logout, onCartClick }) => {
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleCart = () => {
    if (!userDisplayName) {
      navigate("/login");
      return;
    }
    if (cartCount === 0) {
      onCartClick && onCartClick();
    } else {
      onCartClick && onCartClick();
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg shadow-sm mb-4 p-3 rounded-4 ${isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"}`}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          ⌚ SEIKO STORE
        </Link>

        <div className="d-flex gap-3 ms-4 me-auto">
          <Link className="nav-link fw-medium" to="/">🏪 Store</Link>
          <Link className="nav-link fw-medium" to="/about">ℹ️ About</Link>
          <Link className="nav-link fw-medium" to="/contact">📬 Contact</Link>
          <Link className="nav-link fw-medium" to="/returns">↩️ Returns</Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={toggle}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Cart */}
          <div className="position-relative" style={{ cursor: "pointer" }} onClick={handleCart}>
            <span style={{ fontSize: "1.5rem" }}>🛒</span>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </div>

          {userDisplayName ? (
            <>
              <span className="small text-secondary">👋 {userDisplayName}</span>
              <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={logout}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill">Giriş</Link>
              <Link to="/register" className="btn btn-dark btn-sm rounded-pill">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
