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

  if (loading) {
    return (
      <div style={pageContainer}>
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p style={loadingText}>Loading airports...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <div style={mainContainer}>
        {/* Hero Section */}
        <div style={heroSection}>
          <h1 style={heroTitle}>Welcome to Nicks Flight Tracker</h1>
          <p style={heroSubtitle}>
            Your comprehensive flight management and airport information system
          </p>
          <div style={heroDescription}>
            <p style={descriptionText}>
              Discover real-time flight information, manage airport operations, and explore 
              detailed airport data all in one place. Whether you&apos;re a traveler checking 
              flight status or an administrator managing operations, our platform provides 
              the tools you need for efficient airport management.
            </p>
          </div>
        </div>

        {/* Airports Section */}
        <div style={airportsSection}>
          <h2 style={sectionTitle}>
            <span style={sectionIcon}>🏢</span>
            Select an Airport
          </h2>
          <p style={sectionSubtitle}>
            Choose from our network of airports to view detailed flight information and schedules
          </p>

          {errMsg ? (
            <div style={errorAlert}>
              <span style={errorIcon}>⚠️</span>
              {errMsg}
            </div>
          ) : airports.length === 0 ? (
            <div style={emptyState}>
              <div style={emptyIcon}>🏢</div>
              <h3 style={emptyTitle}>No airports available</h3>
              <p style={emptyMessage}>Please check back later or contact support.</p>
            </div>
          ) : (
            <div style={airportsGrid}>
              {airports.map((airport) => (
                <Link
                  key={airport.id}
                  to={`/airports/${airport.id}`}
                  style={airportCard}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-4px)";
                    e.target.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div style={airportHeader}>
                    <div style={airportIcon}>✈️</div>
                    <div style={airportCode}>{airport.code}</div>
                  </div>
                  <h3 style={airportName}>{airport.name}</h3>
                  <div style={airportDetails}>
                    {airport.city && (
                      <p style={airportLocation}>
                        📍 {airport.city}{airport.country && `, ${airport.country}`}
                      </p>
                    )}
                  </div>
                  <div style={viewDetailsButton}>
                    View Airport Details →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div style={featuresSection}>
          <h2 style={sectionTitle}>
            <span style={sectionIcon}>🚀</span>
            Platform Features
          </h2>
          <div style={featuresGrid}>
            <div style={featureCard}>
              <div style={featureIcon}>📊</div>
              <h3 style={featureTitle}>Real-time Flight Data</h3>
              <p style={featureDescription}>
                Access up-to-date flight schedules, delays, and gate information across all airports
              </p>
            </div>
            <div style={featureCard}>
              <div style={featureIcon}>🎯</div>
              <h3 style={featureTitle}>Advanced Search & Filtering</h3>
              <p style={featureDescription}>
                Find flights quickly with powerful search and filtering capabilities
              </p>
            </div>
            <div style={featureCard}>
              <div style={featureIcon}>⚡</div>
              <h3 style={featureTitle}>Instant Navigation</h3>
              <p style={featureDescription}>
                Seamlessly navigate between flights and airports with clickable links
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === STYLES ===

const pageContainer = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "32px 16px",
};

const mainContainer = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "48px",
};

const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  gap: "16px",
  color: "white",
};

const spinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255, 255, 255, 0.3)",
  borderTop: "4px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const loadingText = {
  fontSize: "18px",
  margin: "0",
};

const heroSection = {
  textAlign: "center",
  color: "white",
  padding: "60px 20px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "20px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
};

const heroTitle = {
  fontSize: "3.5rem",
  fontWeight: "700",
  margin: "0 0 24px 0",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const heroSubtitle = {
  fontSize: "1.4rem",
  margin: "0 0 32px 0",
  opacity: "0.9",
  fontWeight: "400",
};

const heroDescription = {
  maxWidth: "800px",
  margin: "0 auto",
};

const descriptionText = {
  fontSize: "1.1rem",
  lineHeight: "1.6",
  margin: "0",
  opacity: "0.8",
};

const airportsSection = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "48px 32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

const sectionTitle = {
  fontSize: "2.5rem",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 16px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};

const sectionIcon = {
  fontSize: "2.5rem",
};

const sectionSubtitle = {
  fontSize: "1.2rem",
  color: "#6b7280",
  margin: "0 0 40px 0",
  textAlign: "center",
  maxWidth: "600px",
  marginLeft: "auto",
  marginRight: "auto",
};

const errorAlert = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 20px",
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "12px",
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "500",
  marginBottom: "24px",
};

const errorIcon = {
  fontSize: "18px",
};

const emptyState = {
  textAlign: "center",
  padding: "80px 20px",
  color: "#6b7280",
};

const emptyIcon = {
  fontSize: "64px",
  marginBottom: "24px",
};

const emptyTitle = {
  fontSize: "1.8rem",
  fontWeight: "600",
  margin: "0 0 16px 0",
  color: "#374151",
};

const emptyMessage = {
  fontSize: "1.1rem",
  margin: "0",
};

const airportsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "24px",
};

const airportCard = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "16px",
  padding: "24px",
  textDecoration: "none",
  color: "inherit",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

const airportHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
};

const airportIcon = {
  fontSize: "24px",
};

const airportCode = {
  fontSize: "1.2rem",
  fontWeight: "700",
  color: "#3b82f6",
  background: "rgba(59, 130, 246, 0.1)",
  padding: "6px 12px",
  borderRadius: "8px",
  border: "2px solid rgba(59, 130, 246, 0.2)",
};

const airportName = {
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 12px 0",
};

const airportDetails = {
  marginBottom: "20px",
};

const airportLocation = {
  fontSize: "1rem",
  color: "#6b7280",
  margin: "0",
  fontWeight: "500",
};

const viewDetailsButton = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#3b82f6",
  textAlign: "center",
  padding: "8px 0",
  borderTop: "1px solid rgba(59, 130, 246, 0.1)",
  marginTop: "16px",
};

const featuresSection = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "48px 32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

const featuresGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "32px",
  marginTop: "40px",
};

const featureCard = {
  textAlign: "center",
  padding: "32px 24px",
  background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
  borderRadius: "16px",
  border: "1px solid rgba(59, 130, 246, 0.1)",
};

const featureIcon = {
  fontSize: "48px",
  marginBottom: "20px",
};

const featureTitle = {
  fontSize: "1.4rem",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 16px 0",
};

const featureDescription = {
  fontSize: "1rem",
  color: "#6b7280",
  lineHeight: "1.6",
  margin: "0",
};
