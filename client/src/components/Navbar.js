import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ userDisplayName, cartCount, logout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4 p-3 rounded-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">⌚ SEIKO STORE</Link>
        <div className="d-flex align-items-center">
          <span className="me-3 small text-secondary">👋 {userDisplayName}</span>
          <div className="me-3 position-relative" style={{cursor: "pointer"}} data-bs-toggle="modal" data-bs-target="#cartModal">
            <span style={{fontSize: "1.5rem"}}>🛒</span>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{cartCount}</span>
          </div>
          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={logout}>Çıkış</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;