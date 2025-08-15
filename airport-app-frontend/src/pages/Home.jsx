import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
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
        const res = await http.get("http://localhost:8080/airports");
        if (isMounted) {
          setAirports(res.data || []);
          setLoading(false);
        }
      } catch (err) {
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
      
      <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ padding: 32, maxWidth: 600, width: "100%" }}>
        <h2 style={{ marginBottom: 16 }}>Airports</h2>

        {loading ? (
          <p>Loading airports...</p>
        ) : errMsg ? (
          <p style={{ color: "red" }}>{errMsg}</p>
        ) : airports.length === 0 ? (
          <p>No airports found.</p>
        ) : (
          <ul>
            {Array.isArray(airports) ? (
              airports.map((airport) => (
                <li key={airport.id}>
                  <Link to={`http://localhost:8080/airports/${airport.id}`}>{airport.name}</Link>
                </li>
              ))
            ) : (
              <p>Loading airports...</p>
            )}
          </ul>
        )}
      </div>
      </div>
  );
}
