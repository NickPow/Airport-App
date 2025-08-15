import React, { useEffect, useState } from "react";
import axios from "axios";
import FlightTable from "../components/FlightTable";

const Admin = () => {
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState({
    flightNumber: "",
    airline: "",
    departureTime: "",
    arrivalTime: "",
    origin: "",
    destination: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/flights");

        console.log("Fetched flights raw response:", res.data);

        if (isMounted) {
          if (!Array.isArray(res.data)) {
            setErrMsg("Unexpected response format from backend.");
            setLoading(false);
            return;
          }

          const normalized = res.data.map((f) => ({
            id: f.id,
            flightNumber: f.flightNumber,
            airline: f.airline?.name || "",
            aircraft: f.aircraft?.type || "",
            status: f.status,
            flightType: f.flightType,
            scheduledTime: f.scheduledTime,
            origin: f.origin?.code || f.origin || "",
            destination: f.destination?.code || f.destination || "",
            departureTime: f.scheduledTime,
            arrivalTime: f.scheduledTime,
          }));

          setFlights(normalized);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch flights", err);
        if (isMounted) {
          setErrMsg("Failed to load flights.");
          setLoading(false);
        }
      }
    };

    fetchFlights();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        flightNumber: form.flightNumber,
        airline: form.airline,
        origin: form.origin,
        destination: form.destination,
        scheduledTime: form.departureTime,
        flightType: "DEPARTURE", // or "ARRIVAL" – depending on your UI design
        status: "ON_TIME",
        aircraftId: null,
        gateId: null,
      };

      if (editingId) {
        const res = await axios.put(
          `http://localhost:8080/admin/flights/${editingId}`,
          payload
        );
        const updated = {
          id: res.data.id,
          flightNumber: res.data.flightNumber,
          airline: res.data.airline?.name || "",
          origin: res.data.origin?.code || "",
          destination: res.data.destination?.code || "",
          departureTime: res.data.scheduledTime,
          arrivalTime: res.data.scheduledTime,
        };
        setFlights(flights.map((f) => (f.id === editingId ? updated : f)));
        setEditingId(null);
      } else {
        const res = await axios.post("http://localhost:8080/admin/flights", payload);
        const added = {
          id: res.data.id,
          flightNumber: res.data.flightNumber,
          airline: res.data.airline?.name || "",
          origin: res.data.origin?.code || "",
          destination: res.data.destination?.code || "",
          departureTime: res.data.scheduledTime,
          arrivalTime: res.data.scheduledTime,
        };
        setFlights([...flights, added]);
      }

      setForm({
        flightNumber: "",
        airline: "",
        departureTime: "",
        arrivalTime: "",
        origin: "",
        destination: "",
      });
    } catch (err) {
      console.error("Flight save error", err);
      setErrMsg("Failed to save flight.");
    }
  };

  const handleEdit = (flight) => {
    setForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      origin: flight.origin,
      destination: flight.destination,
    });
    setEditingId(flight.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/admin/flights/${id}`);
      setFlights(flights.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error", err);
      setErrMsg("Failed to delete flight.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 800, width: "100%", padding: 32 }}>
        <h1>Admin Panel</h1>

        {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <input
            name="flightNumber"
            placeholder="Flight Number"
            value={form.flightNumber}
            onChange={handleChange}
            required
          />
          <input
            name="airline"
            placeholder="Airline"
            value={form.airline}
            onChange={handleChange}
            required
          />
          <input
            name="departureTime"
            type="datetime-local"
            value={form.departureTime}
            onChange={handleChange}
            required
          />
          <input
            name="arrivalTime"
            type="datetime-local"
            value={form.arrivalTime}
            onChange={handleChange}
            required
          />
          <input
            name="origin"
            placeholder="Origin Airport Code"
            value={form.origin}
            onChange={handleChange}
            required
          />
          <input
            name="destination"
            placeholder="Destination Airport Code"
            value={form.destination}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? "Update" : "Add"} Flight</button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  flightNumber: "",
                  airline: "",
                  departureTime: "",
                  arrivalTime: "",
                  origin: "",
                  destination: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <p>Loading flights...</p>
        ) : Array.isArray(flights) ? (
          <FlightTable
            flights={flights}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <p style={{ color: "red" }}>Invalid flight data format.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
