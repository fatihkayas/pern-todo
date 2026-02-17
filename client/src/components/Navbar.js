import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ userDisplayName, cartCount, logout }) => {
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    toast.success("Çıkış yapıldı. Görüşürüz! 👋");
    setTimeout(() => logout(), 1000);
  };

  const handleCart = () => {
    if (cartCount === 0) {
      toast("Sepetiniz boş 🛒", { icon: "ℹ️" });
    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg shadow-sm mb-4 p-3 rounded-4 ${
        isDark ? "navbar-dark bg-dark" : "navbar-light bg-white"
      }`}
    >
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          ⌚ SEIKO STORE
        </Link>

        {/* Nav links */}
        <div className="d-flex gap-3 ms-4 me-auto">
          <Link className="nav-link fw-medium" to="/">🏪 Store</Link>
          <Link className="nav-link fw-medium" to="/about">ℹ️ About</Link>
          <Link className="nav-link fw-medium" to="/contact">📬 Contact</Link>
          <Link className="nav-link fw-medium" to="/returns">↩️ Returns</Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="small text-secondary">👋 {userDisplayName}</span>

          {/* Dark mode toggle */}
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill"
            onClick={toggle}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Cart */}
          <div
            className="position-relative"
            style={{ cursor: "pointer" }}
            data-bs-toggle="modal"
            data-bs-target="#cartModal"
            onClick={handleCart}
          >
            <span style={{ fontSize: "1.5rem" }}>🛒</span>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
              </span>
            )}
          </div>

          <button
            className="btn btn-outline-danger btn-sm rounded-pill"
            onClick={handleLogout}
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;