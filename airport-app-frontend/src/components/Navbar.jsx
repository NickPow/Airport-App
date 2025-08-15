import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkStyle = (to) => ({
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "12px",
    background: pathname === to 
      ? "rgba(255, 255, 255, 0.25)" 
      : "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    marginLeft: "8px",
    transition: "all 0.3s ease",
    fontWeight: pathname === to ? "600" : "500",
    fontSize: "14px",
    border: pathname === to 
      ? "1px solid rgba(255, 255, 255, 0.3)" 
      : "1px solid transparent",
    boxShadow: pathname === to 
      ? "0 4px 12px rgba(0, 0, 0, 0.15)" 
      : "none",
  });

  const handleLinkHover = (e, isActive) => {
    if (!isActive) {
      e.target.style.background = "rgba(255, 255, 255, 0.2)";
      e.target.style.transform = "translateY(-1px)";
    }
  };

  const handleLinkLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.background = "rgba(255, 255, 255, 0.1)";
      e.target.style.transform = "translateY(0)";
    }
  };

  return (
    <nav style={navContainer}>
      <div style={navContent}>
        <div style={brandSection}>
          <div style={logoIcon}>✈️</div>
          <h1 style={brandTitle}>Nicks Flight Tracker</h1>
        </div>
        <div style={linksContainer}>
          <Link 
            to="/" 
            style={linkStyle("/")}
            onMouseEnter={(e) => handleLinkHover(e, pathname === "/")}
            onMouseLeave={(e) => handleLinkLeave(e, pathname === "/")}
          >
            🏠 Home
          </Link>
          <Link 
            to="/flights" 
            style={linkStyle("/flights")}
            onMouseEnter={(e) => handleLinkHover(e, pathname === "/flights")}
            onMouseLeave={(e) => handleLinkLeave(e, pathname === "/flights")}
          >
            ✈️ Flights
          </Link>
          <Link 
            to="/admin" 
            style={linkStyle("/admin")}
            onMouseEnter={(e) => handleLinkHover(e, pathname === "/admin")}
            onMouseLeave={(e) => handleLinkLeave(e, pathname === "/admin")}
          >
            ⚙️ Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

// === STYLES ===

const navContainer = {
  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const navContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 32px",
};

const brandSection = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoIcon = {
  fontSize: "28px",
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
};

const brandTitle = {
  margin: 0,
  color: "#ffffff",
  fontSize: "1.8rem",
  fontWeight: "700",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  letterSpacing: "-0.5px",
};

const linksContainer = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};
