import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import http from "../api/http";

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedFlightId, setHighlightedFlightId] = useState(null);
  const [airportCodeToId, setAirportCodeToId] = useState({});
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlights();
    loadAirportMapping();
  }, []);

  // Load airport mapping
  const loadAirportMapping = async () => {
    try {
      const res = await http.get("/airports");
      const mapping = {};
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach(airport => {
          if (airport.code && airport.id) {
            mapping[airport.code] = airport.id;
          }
        });
      }
      setAirportCodeToId(mapping);
    } catch (error) {
      console.error("Failed to load airport mapping:", error);
    }
  };

  const handleAirportClick = (airportCode) => {
    const airportId = airportCodeToId[airportCode];
    if (airportId) {
      navigate(`/airports/${airportId}`);
    } else {
      console.warn(`No airport ID found for code: ${airportCode}`);
    }
  };

  // Handle URL parameters for flight highlighting
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const flightId = searchParams.get('highlight');
    if (flightId) {
      setHighlightedFlightId(parseInt(flightId));
      // Scroll to highlighted flight after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(`flight-${flightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.search]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/admin/flights");
      
      // Use real backend data
      const enhancedFlights = (Array.isArray(response.data) ? response.data : []).map(flight => ({
        id: flight.id,
        flightNumber: flight.flightNumber || "N/A",
        airline: flight.airlineName || "Unknown Airline",
        aircraft: flight.aircraftType || "N/A",
        origin: flight.originCode || "N/A",
        destination: flight.destinationCode || "N/A",
        departureTime: flight.scheduledTime || "N/A",
        arrivalTime: flight.scheduledTime || "N/A",
        status: flight.status || "UNKNOWN",
        flightType: flight.flightType || "DEPARTURE",
        gate: flight.gateNumber || "N/A",
        terminalNumber: flight.terminalNumber || "N/A",
        passengerCapacity: flight.passengerCapacity || "N/A",
        currentPassengers: flight.currentPassengerCount || 0,
        checkInStatus: "OPEN",
        estimatedDeparture: flight.scheduledTime || "N/A",
        delay: 0,
      }));

      // Simulate some passengers for demonstration
      const flightsWithPassengers = enhancedFlights.map(flight => ({
        ...flight,
        currentPassengers: Math.floor(Math.random() * flight.passengerCapacity * 0.9),
      }));

      setFlights(flightsWithPassengers);
      setError("");
    } catch (err) {
      console.error("Failed to fetch flights:", err);
      setError("Failed to load flight information");
    } finally {
      setLoading(false);
    }
  };

  // Handle flight tile click
  const handleFlightClick = (flightId) => {
    setHighlightedFlightId(flightId);
    // Update URL without page reload
    const newUrl = `${location.pathname}?highlight=${flightId}`;
    navigate(newUrl, { replace: true });
    
    // Scroll to the clicked flight
    setTimeout(() => {
      const element = document.getElementById(`flight-${flightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Clear highlighting
  const clearHighlight = () => {
    setHighlightedFlightId(null);
    navigate(location.pathname, { replace: true });
  };

  // Filter flights based on status and search term
  const filteredFlights = flights.filter(flight => {
    const statusMatch = filterStatus === "ALL" || flight.status === filterStatus;
    const searchMatch = searchTerm === "" || 
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ON_TIME": return "#10b981";
      case "DELAYED": return "#f59e0b";
      case "CANCELLED": return "#ef4444";
      case "BOARDING": return "#3b82f6";
      case "DEPARTED": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getOccupancyColor = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage < 50) return "#10b981";
    if (percentage < 80) return "#f59e0b";
    return "#ef4444";
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === "N/A") return "N/A";
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "N/A";
    }
  };

  const formatDate = (timeString) => {
    if (!timeString || timeString === "N/A") return "N/A";
    try {
      return new Date(timeString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div style={pageContainer}>
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p>Loading flight information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <div style={headerSection}>
        <h1 style={pageTitle}>Flight Information</h1>
        <p style={pageSubtitle}>Real-time flight details, gates, and passenger information</p>
      </div>

      {error && (
        <div style={errorAlert}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      <div style={controlsSection}>
        <div style={searchContainer}>
          <input
            type="text"
            placeholder="Search flights, airlines, airports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
        </div>
        
        <div style={filterContainer}>
          <label style={filterLabel}>Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={filterSelect}
          >
            <option value="ALL">All Flights</option>
            <option value="ON_TIME">On Time</option>
            <option value="DELAYED">Delayed</option>
            <option value="BOARDING">Boarding</option>
            <option value="DEPARTED">Departed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={statsSection}>
        <div style={statCard}>
          <div style={statNumber}>{flights.length}</div>
          <div style={statLabel}>Total Flights</div>
        </div>
        <div style={statCard}>
          <div style={statNumber}>{flights.filter(f => f.status === "ON_TIME").length}</div>
          <div style={statLabel}>On Time</div>
        </div>
        <div style={statCard}>
          <div style={statNumber}>{flights.filter(f => f.status === "DELAYED").length}</div>
          <div style={statLabel}>Delayed</div>
        </div>
        <div style={statCard}>
          <div style={statNumber}>
            {flights.reduce((sum, f) => sum + f.currentPassengers, 0)}
          </div>
          <div style={statLabel}>Total Passengers</div>
        </div>
      </div>

      {highlightedFlightId && (
        <div style={clearHighlightButton} onClick={clearHighlight}>
          <span>✕</span> Clear Highlight
        </div>
      )}

      <div style={flightsGrid}>
        {filteredFlights.map(flight => {
          const isHighlighted = highlightedFlightId === flight.id;
          const cardStyle = isHighlighted ? {
            ...flightCard,
            ...highlightedCardStyle,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: 'scale(1.02)',
            zIndex: 10,
          } : {
            ...flightCard,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            zIndex: 1,
          };
          
          return (
            <div 
              key={flight.id} 
              id={`flight-${flight.id}`}
              style={cardStyle}
              onClick={() => handleFlightClick(flight.id)}
              onMouseEnter={(e) => {
                if (!isHighlighted) {
                  e.target.style.transform = 'scale(1.01)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isHighlighted) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <div style={flightHeader}>
                <div style={flightNumberSection}>
                  <span style={flightNumber}>{flight.flightNumber}</span>
                  <span style={airline}>{flight.airline}</span>
                </div>
                <div 
                  style={{
                    ...statusBadge,
                    backgroundColor: getStatusColor(flight.status)
                  }}
                >
                  {flight.status.replace("_", " ")}
                </div>
              </div>

              <div style={routeSection}>
                <div style={routePoint}>
                  <div 
                    style={clickableAirportCode}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent flight card click
                      handleAirportClick(flight.origin);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#dbeafe";
                      e.target.style.color = "#1e40af";
                    }}
                    title={`View ${flight.origin} airport details`}
                  >
                    {flight.origin}
                  </div>
                  <div style={timeInfo}>
                    <div>{formatTime(flight.departureTime)}</div>
                    <div style={dateInfo}>{formatDate(flight.departureTime)}</div>
                  </div>
                </div>
                <div style={routeArrow}>✈️</div>
                <div style={routePoint}>
                  <div 
                    style={clickableAirportCode}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent flight card click
                      handleAirportClick(flight.destination);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#dbeafe";
                      e.target.style.color = "#1e40af";
                    }}
                    title={`View ${flight.destination} airport details`}
                  >
                    {flight.destination}
                  </div>
                  <div style={timeInfo}>
                    <div>{formatTime(flight.arrivalTime)}</div>
                    <div style={dateInfo}>{formatDate(flight.arrivalTime)}</div>
                  </div>
                </div>
              </div>

              <div style={detailsGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Gate</span>
                  <span style={detailValue}>{flight.gate}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Terminal</span>
                  <span style={detailValue}>{flight.terminalNumber}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Aircraft</span>
                  <span style={detailValue}>{flight.aircraft}</span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Type</span>
                  <span style={detailValue}>{flight.flightType}</span>
                </div>
              </div>

              <div style={passengerSection}>
                <div style={passengerHeader}>
                  <span style={passengerTitle}>Passengers</span>
                  <span 
                    style={{
                      ...passengerCount,
                      color: getOccupancyColor(flight.currentPassengers, flight.passengerCapacity)
                    }}
                  >
                    {flight.currentPassengers} / {flight.passengerCapacity}
                  </span>
                </div>
                <div style={progressBarContainer}>
                  <div 
                    style={{
                      ...progressBar,
                      width: `${(flight.currentPassengers / flight.passengerCapacity) * 100}%`,
                      backgroundColor: getOccupancyColor(flight.currentPassengers, flight.passengerCapacity)
                    }}
                  ></div>
                </div>
                <div style={occupancyText}>
                  {Math.round((flight.currentPassengers / flight.passengerCapacity) * 100)}% Capacity
                </div>
              </div>

              {flight.delay > 0 && (
                <div style={delayNotice}>
                  <span>⚠️</span>
                  Delayed by {flight.delay} minutes
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFlights.length === 0 && !loading && (
        <div style={emptyState}>
          <div style={emptyIcon}>✈️</div>
          <h3>No flights found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// Styles
const pageContainer = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "32px 16px",
};

const headerSection = {
  textAlign: "center",
  marginBottom: "32px",
};

const pageTitle = {
  fontSize: "3rem",
  fontWeight: "700",
  color: "white",
  margin: "0 0 16px 0",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const pageSubtitle = {
  fontSize: "1.2rem",
  color: "rgba(255, 255, 255, 0.9)",
  margin: "0",
  fontWeight: "400",
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
  maxWidth: "1200px",
  margin: "0 auto 24px auto",
};

const controlsSection = {
  display: "flex",
  gap: "20px",
  marginBottom: "32px",
  maxWidth: "1200px",
  margin: "0 auto 32px auto",
  flexWrap: "wrap",
};

const searchContainer = {
  flex: "1",
  minWidth: "300px",
};

const searchInput = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  border: "none",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  outline: "none",
  boxSizing: "border-box",
};

const filterContainer = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const filterLabel = {
  color: "white",
  fontSize: "14px",
  fontWeight: "500",
};

const filterSelect = {
  padding: "12px 16px",
  fontSize: "14px",
  border: "none",
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  outline: "none",
  cursor: "pointer",
};

const statsSection = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "20px",
  maxWidth: "1200px",
  margin: "0 auto 32px auto",
};

const statCard = {
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: "16px",
  padding: "24px",
  textAlign: "center",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
};

const statNumber = {
  fontSize: "2.5rem",
  fontWeight: "700",
  color: "#1f2937",
  margin: "0 0 8px 0",
};

const statLabel = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: "500",
};

const flightsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
  gap: "24px",
  maxWidth: "1200px",
  margin: "0 auto",
};

const flightCard = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15)",
  },
};

const flightHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "20px",
};

const flightNumberSection = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const flightNumber = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1f2937",
};

const airline = {
  fontSize: "14px",
  color: "#6b7280",
  fontWeight: "500",
};

const statusBadge = {
  padding: "6px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
};

const routeSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
  padding: "20px",
  background: "#f8fafc",
  borderRadius: "12px",
};

const routePoint = {
  textAlign: "center",
  flex: "1",
};

const clickableAirportCode = {
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#1e40af",
  marginBottom: "8px",
  backgroundColor: "#dbeafe",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  userSelect: "none",
  display: "inline-block",
};

const timeInfo = {
  fontSize: "14px",
  color: "#6b7280",
};

const dateInfo = {
  fontSize: "12px",
  color: "#9ca3af",
  marginTop: "4px",
};

const routeArrow = {
  fontSize: "1.5rem",
  margin: "0 16px",
  color: "#6b7280",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "24px",
};

const detailItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  background: "#f1f5f9",
  borderRadius: "8px",
};

const detailLabel = {
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
  textTransform: "uppercase",
};

const detailValue = {
  fontSize: "14px",
  color: "#1e293b",
  fontWeight: "600",
};

const passengerSection = {
  marginBottom: "16px",
};

const passengerHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const passengerTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
};

const passengerCount = {
  fontSize: "14px",
  fontWeight: "700",
};

const progressBarContainer = {
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "4px",
  overflow: "hidden",
  marginBottom: "8px",
};

const progressBar = {
  height: "100%",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};

const occupancyText = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center",
};

const delayNotice = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px",
  background: "rgba(245, 158, 11, 0.1)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: "8px",
  color: "#d97706",
  fontSize: "14px",
  fontWeight: "500",
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  color: "white",
  maxWidth: "400px",
  margin: "0 auto",
};

const emptyIcon = {
  fontSize: "4rem",
  marginBottom: "20px",
  opacity: "0.7",
};

const clearHighlightButton = {
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid #6b7280",
  borderRadius: "8px",
  padding: "12px 16px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  boxShadow: "0 4px 12px rgba(107, 114, 128, 0.2)",
  zIndex: "100",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const highlightedCardStyle = {
  background: "linear-gradient(135deg, rgba(156, 163, 175, 0.3), rgba(107, 114, 128, 0.3))",
  backgroundColor: "rgba(229, 231, 235, 0.95)", // gray-200 with opacity
  border: "2px solid #6b7280",
  boxShadow: "0 12px 30px rgba(107, 114, 128, 0.3), 0 0 0 1px rgba(107, 114, 128, 0.15)",
};

export default Flights;
