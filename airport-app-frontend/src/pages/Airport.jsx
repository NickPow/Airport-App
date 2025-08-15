import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FlightTable from "../components/FlightTable";
import http from "../api/http";

export default function Airport() {
  const { id } = useParams();
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const arrRes = await http.get(`http://localhost:8080/airports/${id}/flights/arrivals`);
        const depRes = await http.get(`http://localhost:8080/airports/${id}/flights/departures`);

        if (isMounted) {
          setArrivals(arrRes.data || []);
          setDepartures(depRes.data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load flights:", error);
        if (isMounted) {
          setErrMsg("Failed to load flights for this airport.");
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
    <>
      

      <div style={{ padding: 32 }}>
        {loading ? (
          <p>Loading flight data...</p>
        ) : errMsg ? (
          <p style={{ color: "red" }}>{errMsg}</p>
        ) : arrivals.length === 0 && departures.length === 0 ? (
          <p>No flights available for this airport.</p>
        ) : (
          <>
            <FlightTable title="Arrivals" flights={arrivals} />
            <FlightTable title="Departures" flights={departures} />
          </>
        )}
      </div>
    </>
  );
}
