import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (to) => ({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    background: pathname === to ? "#111827" : "#e5e7eb",
    color: pathname === to ? "#ffffff" : "#111827",
    marginRight: 8,
  });

  return (
    <nav style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <h1 style={{ marginRight: 16 }}>Airport App</h1>
      <Link to="/" style={linkStyle("/")}>Home</Link>
      <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
    </nav>
  );
}
