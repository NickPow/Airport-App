import React, { useEffect, useState } from "react";
import http from "../api/http";
import { Link } from "react-router-dom";

export default function Home() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await http.get("/airports");
        if (isMounted) {
          setAirports(res.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load airports:", error);
        if (isMounted) {
          setErrMsg("Failed to load airports.");
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={outerWrapper}>
      <div style={glassContainer}>
        <h1 style={heading}>Choose an Airport</h1>

        {loading ? (
          <p style={message}>Loading airports...</p>
        ) : errMsg ? (
          <p style={{ ...message, color: "red" }}>{errMsg}</p>
        ) : airports.length === 0 ? (
          <p style={message}>No airports found.</p>
        ) : (
          <div style={cardGrid}>
            {airports.map((airport) => (
              <Link
                key={airport.id}
                to={`/airports/${airport.id}`}
                style={card}
              >
                <h3 style={cardTitle}>{airport.name}</h3>
                <p style={cardCode}>{airport.code}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    
  );
}

// === STYLES ===

const outerWrapper = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(145deg, #c6d0ff, #f7f9ff)",
  padding: "32px 16px",
  
};

const glassContainer = {
  maxWidth: 960,
  width: "100%",
  padding: 32,
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.6)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
  textAlign: "center",
};

const heading = {
  fontSize: "2.5rem",
  marginBottom: "32px",
  color: "#1f2937",
};

const message = {
  fontSize: "1.2rem",
  color: "#4b5563",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "24px",
};

const card = {
  padding: "24px",
  background: "rgba(255, 255, 255, 0.6)",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
  textDecoration: "none",
  color: "#111827",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const cardTitle = {
  fontSize: "1.3rem",
  marginBottom: "8px",
};

const cardCode = {
  fontSize: "1rem",
  color: "#6b7280",
};

card["onMouseEnter"] = (e) => {
  e.currentTarget.style.transform = "scale(1.03)";
  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.15)";
};

card["onMouseLeave"] = (e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
};
