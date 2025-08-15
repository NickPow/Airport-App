import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (to) => ({
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: 8,
    background: pathname === to ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    marginLeft: 12,
    transition: "background 0.2s ease",
  });

  return (
    <nav style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      marginBottom: 16,
      padding: "16px 32px",
      background: "rgba(31, 41, 55, 0.9)",
      backdropFilter: "blur(8px)"
    }}>
      <h1 style={{ margin: 0, color: "#ffffff" }}>Airport App</h1>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/flights" style={linkStyle("/flights")}>Flights</Link>
        <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>
      </div>
    </nav>
  );
}
