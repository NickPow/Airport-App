import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import FlightTable from "../components/FlightTable";
import http from "../api/http";

export default function Airport() {
  const { id } = useParams();
  const [airport, setAirport] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Load flight data (this should work since it worked before)
        const arrRes = await http.get(`/airports/${id}/flights/arrivals`);
        const depRes = await http.get(`/airports/${id}/flights/departures`);

        console.log("Raw arrivals data:", arrRes.data);
        console.log("Raw departures data:", depRes.data);
        if (arrRes.data && arrRes.data.length > 0) {
          console.log("Sample arrival flight:", arrRes.data[0]);
        }
        if (depRes.data && depRes.data.length > 0) {
          console.log("Sample departure flight:", depRes.data[0]);
        }

        if (isMounted) {
          // Normalize arrivals data
          const normalizedArrivals = Array.isArray(arrRes.data) ? arrRes.data.map((flight) => ({
            id: flight.id,
            flightNumber: flight.flightNumber,
            airline: flight.airlineName || flight.airline || "-",
            origin: flight.originCode || flight.origin || "-",
            destination: flight.destinationCode || flight.destination || "-",
            departureTime: flight.scheduledTime || flight.departureTime,
            arrivalTime: flight.scheduledTime || flight.arrivalTime,
            status: flight.status || "Scheduled",
            flightType: flight.flightType
          })) : [];

          // Normalize departures data
          const normalizedDepartures = Array.isArray(depRes.data) ? depRes.data.map((flight) => ({
            id: flight.id,
            flightNumber: flight.flightNumber,
            airline: flight.airlineName || flight.airline || "-",
            origin: flight.originCode || flight.origin || "-",
            destination: flight.destinationCode || flight.destination || "-",
            departureTime: flight.scheduledTime || flight.departureTime,
            arrivalTime: flight.scheduledTime || flight.arrivalTime,
            status: flight.status || "Scheduled",
            flightType: flight.flightType
          })) : [];

          setArrivals(normalizedArrivals);
          setDepartures(normalizedDepartures);
          setLoading(false);
        }

        // Try to load airport details, but don't fail if it doesn't exist
        try {
          const airportRes = await http.get(`http://localhost:8080/airports/${id}`);
          if (isMounted) {
            setAirport(airportRes.data);
          }
        } catch (airportError) {
          console.log("Airport details endpoint not available, using fallback", airportError.message);
          // Try to get airport info from the list of all airports
          try {
            const allAirportsRes = await http.get("/airports");
            const foundAirport = allAirportsRes.data.find(airport => airport.id == id);
            if (isMounted && foundAirport) {
              setAirport(foundAirport);
            } else if (isMounted) {
              // Create a fallback airport object with just the ID
              setAirport({
                id: id,
                name: `Airport ${id}`,
                code: `AP${id}`,
                city: null,
                country: null
              });
            }
          } catch (fallbackError) {
            console.log("Could not fetch airports list either", fallbackError.message);
            if (isMounted) {
              // Create a fallback airport object with just the ID
              setAirport({
                id: id,
                name: `Airport ${id}`,
                code: `AP${id}`,
                city: null,
                country: null
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load flight data:", error);
        if (isMounted) {
          // Set empty arrays for flights to prevent crashes
          setArrivals([]);
          setDepartures([]);
          // Create a basic airport object
          setAirport({
            id: id,
            name: `Airport ${id}`,
            code: `AP${id}`,
            city: null,
            country: null
          });
          setErrMsg("Could not connect to the server. Please check if the backend is running and CORS is configured.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div style={outerWrapper}>
      <div style={mainContainer}>
        {loading ? (
          <div style={loadingState}>
            <div style={spinner}></div>
            <p style={loadingText}>Loading airport information...</p>
          </div>
        ) : errMsg ? (
          <div style={errorState}>
            <span style={errorIcon}>⚠️</span>
            <p style={errorText}>{errMsg}</p>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <Link to="/" style={backButton}>
              ← Back to Airports
            </Link>

            {/* Airport Header */}
            {airport && (
              <div style={airportHeader}>
                <div style={airportInfo}>
                  <h1 style={airportName}>{airport.name}</h1>
                  <div style={airportCode}>{airport.code}</div>
                  {airport.city && (
                    <p style={airportLocation}>
                      📍 {airport.city}{airport.country && `, ${airport.country}`}
                    </p>
                  )}
                </div>
                <div style={flightStats}>
                  <div style={statCard}>
                    <div style={statNumber}>{departures.length}</div>
                    <div style={statLabel}>Departures</div>
                  </div>
                  <div style={statCard}>
                    <div style={statNumber}>{arrivals.length}</div>
                    <div style={statLabel}>Arrivals</div>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Tables */}
            {arrivals.length === 0 && departures.length === 0 ? (
              <div style={noFlightsState}>
                <div style={noFlightsIcon}>✈️</div>
                <h3 style={noFlightsTitle}>No flights scheduled</h3>
                <p style={noFlightsMessage}>
                  There are currently no flights scheduled for this airport.
                </p>
              </div>
            ) : (
              <div style={flightTablesContainer}>
                {departures.length > 0 && (
                  <div style={tableSection}>
                    <h2 style={sectionTitle}>
                      <span style={sectionIcon}>🛫</span>
                      Departures ({departures.length})
                    </h2>
                    <FlightTable flights={departures} />
                  </div>
                )}
                
                {arrivals.length > 0 && (
                  <div style={tableSection}>
                    <h2 style={sectionTitle}>
                      <span style={sectionIcon}>🛬</span>
                      Arrivals ({arrivals.length})
                    </h2>
                    <FlightTable flights={arrivals} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// === STYLES ===

const outerWrapper = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "32px 16px",
};

const mainContainer = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const loadingState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 20px",
  gap: "16px",
};

const spinner = {
  width: "32px",
  height: "32px",
  border: "3px solid rgba(255, 255, 255, 0.3)",
  borderTop: "3px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const loadingText = {
  color: "white",
  fontSize: "18px",
  margin: "0",
};

const errorState = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "24px 32px",
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "12px",
  color: "#dc2626",
  margin: "20px 0",
};

const errorIcon = {
  fontSize: "24px",
};

const errorText = {
  fontSize: "16px",
  margin: "0",
};

const airportHeader = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "24px",
};

const airportInfo = {
  flex: "1",
  minWidth: "300px",
};

const airportName = {
  fontSize: "2.5rem",
  fontWeight: "700",
  color: "#1f2937",
  margin: "0 0 12px 0",
};

const airportCode = {
  display: "inline-block",
  fontSize: "1.2rem",
  fontWeight: "600",
  color: "#3b82f6",
  background: "rgba(59, 130, 246, 0.1)",
  padding: "8px 16px",
  borderRadius: "8px",
  border: "2px solid rgba(59, 130, 246, 0.3)",
  marginBottom: "16px",
};

const airportLocation = {
  fontSize: "1.1rem",
  color: "#6b7280",
  margin: "0",
  fontWeight: "500",
};

const flightStats = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};

const statCard = {
  textAlign: "center",
  padding: "20px",
  background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
  borderRadius: "12px",
  border: "1px solid #bae6fd",
  minWidth: "100px",
};

const statNumber = {
  fontSize: "2rem",
  fontWeight: "700",
  color: "#0369a1",
  margin: "0 0 8px 0",
};

const statLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0",
};

const noFlightsState = {
  textAlign: "center",
  padding: "80px 20px",
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

const noFlightsIcon = {
  fontSize: "64px",
  marginBottom: "24px",
};

const noFlightsTitle = {
  fontSize: "1.8rem",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 16px 0",
};

const noFlightsMessage = {
  fontSize: "1.1rem",
  color: "#6b7280",
  margin: "0",
};

const flightTablesContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};

const tableSection = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

const sectionTitle = {
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0 0 24px 0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const sectionIcon = {
  fontSize: "1.5rem",
};

const backButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 20px",
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "12px",
  textDecoration: "none",
  color: "#374151",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "2px solid rgba(59, 130, 246, 0.2)",
};
