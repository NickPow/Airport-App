import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

export default function FlightTable({ flights, onEdit, onDelete }) {
  
  console.log("FlightTable received flights:", flights);
  
  const navigate = useNavigate();
  const [airportCodeToId, setAirportCodeToId] = useState({});
  
  const safeFlights = Array.isArray(flights) ? flights : [];

  // Load airport mapping when component mounts
  useEffect(() => {
    async function loadAirportMapping() {
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
    }
    loadAirportMapping();
  }, []);

  const handleAirportClick = (airportCode) => {
    const airportId = airportCodeToId[airportCode];
    if (airportId) {
      navigate(`/airports/${airportId}`);
    } else {
      console.warn(`No airport ID found for code: ${airportCode}`);
    }
  };
  
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "on_time":
        return "#10b981";
      case "delayed":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={tableContainer}>
      {safeFlights.length === 0 ? (
        <div style={emptyState}>
          <div style={emptyIcon}>✈️</div>
          <h3 style={emptyTitle}>No flights scheduled</h3>
          <p style={emptyMessage}>Add your first flight using the form above.</p>
        </div>
      ) : (
        <div style={tableWrapper}>
          <table style={table}>
            <thead>
              <tr style={headerRow}>
                <th style={th}>Flight</th>
                <th style={th}>Airline</th>
                <th style={th}>Aircraft</th>
                <th style={th}>Route</th>
                <th style={th}>Departure</th>
                <th style={th}>Gate</th>
                <th style={th}>Terminal</th>
                <th style={th}>Status</th>
                <th style={th}>Type</th>
                <th style={th}>Capacity</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeFlights.map((flight, index) => (
                <tr key={flight.id} style={{...dataRow, backgroundColor: index % 2 === 0 ? "#f9fafb" : "white"}}>
                  <td style={td}>
                    <div 
                      style={clickableFlightNumber}
                      onClick={() => navigate(`/flights?highlight=${flight.id}`)}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#1d4ed8";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#3b82f6";
                      }}
                      title="View flight details"
                    >
                      {flight.flightNumber}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={airlineName}>{flight.airline || "-"}</div>
                  </td>
                  <td style={td}>
                    <div style={aircraftInfo}>{flight.aircraft || "-"}</div>
                  </td>
                  <td style={td}>
                    <div style={routeInfo}>
                      <span 
                        style={clickableRouteCode}
                        onClick={() => handleAirportClick(flight.origin)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#e5e7eb";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#f3f4f6";
                        }}
                        title={`View ${flight.origin} airport details`}
                      >
                        {flight.origin || "-"}
                      </span>
                      <span style={routeArrow}>→</span>
                      <span 
                        style={clickableRouteCode}
                        onClick={() => handleAirportClick(flight.destination)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#e5e7eb";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#f3f4f6";
                        }}
                        title={`View ${flight.destination} airport details`}
                      >
                        {flight.destination || "-"}
                      </span>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={timeInfo}>{flight.departureTime ? formatDateTime(flight.departureTime) : "-"}</div>
                  </td>
                  <td style={td}>
                    <div style={gateInfo}>{flight.gate || "-"}</div>
                  </td>
                  <td style={td}>
                    <div style={terminalInfo}>{flight.terminalNumber || "-"}</div>
                  </td>
                  <td style={td}>
                    <span style={{
                      ...statusBadge,
                      backgroundColor: getStatusColor(flight.status) + "20",
                      color: getStatusColor(flight.status),
                    }}>
                      {flight.status || "Scheduled"}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={flightTypeInfo}>{flight.flightType || "DEPARTURE"}</div>
                  </td>
                  <td style={td}>
                    <div style={capacityInfo}>
                      {flight.passengerCapacity ? `${flight.passengerCapacity} seats` : "-"}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={actionButtons}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(flight)}
                          style={editButton}
                          title="Edit flight"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete flight ${flight.flightNumber}?`)) {
                              onDelete(flight.id);
                            }
                          }}
                          style={deleteButton}
                          title="Delete flight"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// === STYLES ===

const tableContainer = {
  marginTop: "8px",
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#6b7280",
};

const emptyIcon = {
  fontSize: "48px",
  marginBottom: "16px",
};

const emptyTitle = {
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 8px 0",
  color: "#374151",
};

const emptyMessage = {
  fontSize: "14px",
  margin: "0",
};

const tableWrapper = {
  overflowX: "auto",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
  background: "white",
};

const headerRow = {
  background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
};

const th = {
  textAlign: "left",
  padding: "16px 20px",
  fontWeight: "600",
  fontSize: "13px",
  color: "#374151",
  borderBottom: "2px solid #e5e7eb",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const dataRow = {
  transition: "background-color 0.2s ease",
  ":hover": {
    backgroundColor: "#f3f4f6",
  },
};

const td = {
  padding: "16px 20px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle",
};

const clickableFlightNumber = {
  fontWeight: "600",
  fontSize: "15px",
  color: "#3b82f6",
  cursor: "pointer",
  textDecoration: "underline",
  transition: "color 0.2s ease",
};

const airlineName = {
  color: "#4b5563",
  fontSize: "14px",
};

const aircraftInfo = {
  color: "#4b5563",
  fontSize: "13px",
  fontStyle: "italic",
};

const routeInfo = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const clickableRouteCode = {
  fontWeight: "600",
  color: "#1f2937",
  fontSize: "13px",
  padding: "4px 8px",
  background: "#f3f4f6",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  userSelect: "none",
};

const routeArrow = {
  color: "#9ca3af",
  fontSize: "12px",
};

const timeInfo = {
  color: "#4b5563",
  fontSize: "13px",
  fontWeight: "500",
};

const gateInfo = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
  backgroundColor: "#f3f4f6",
  padding: "4px 8px",
  borderRadius: "4px",
  textAlign: "center",
};

const terminalInfo = {
  color: "#1f2937",
  fontSize: "13px",
  fontWeight: "500",
};

const statusBadge = {
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const flightTypeInfo = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const capacityInfo = {
  color: "#4b5563",
  fontSize: "13px",
};

const actionButtons = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
};

const editButton = {
  padding: "6px 8px",
  border: "none",
  borderRadius: "6px",
  background: "#f0f9ff",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background 0.2s ease",
  ":hover": {
    background: "#e0f2fe",
  },
};

const deleteButton = {
  padding: "6px 8px",
  border: "none",
  borderRadius: "6px",
  background: "#fef2f2",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background 0.2s ease",
  ":hover": {
    background: "#fee2e2",
  },
};

FlightTable.propTypes = {
  flights: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
