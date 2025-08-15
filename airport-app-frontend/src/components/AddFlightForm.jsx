import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const AddFlightForm = ({ onFlightAdded }) => {
  const [formData, setFormData] = useState({
    flightNumber: "",
    flightType: "DEPARTURE",
    status: "ON_TIME",
    scheduledTime: "",
    airlineId: "",
    aircraftId: "",
    gateId: "",
    originAirportId: "",
    destinationAirportId: "",
  });

  const [dropdownData, setDropdownData] = useState({
    airlines: [],
    aircrafts: [],
    gates: [],
    airports: [],
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      const urls = [
        { key: "airlines", url: "/airlines" },
        { key: "aircrafts", url: "/aircrafts" },
        { key: "gates", url: "/gates" },
        { key: "airports", url: "/airports" },
      ];

      const results = {};
      for (const { key, url } of urls) {
        const res = await fetch(`http://localhost:8080${url}`);
        results[key] = await res.json();
      }

      setDropdownData(results);
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8080/admin/flights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const newFlight = await res.json();
      onFlightAdded(newFlight);
    } else {
      console.error("Failed to add flight");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Flight</h3>

      <input
        type="text"
        name="flightNumber"
        placeholder="Flight Number"
        value={formData.flightNumber}
        onChange={handleChange}
        required
      />

      <select name="flightType" value={formData.flightType} onChange={handleChange}>
        <option value="DEPARTURE">Departure</option>
        <option value="ARRIVAL">Arrival</option>
      </select>

      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="ON_TIME">On Time</option>
        <option value="DELAYED">Delayed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <input
        type="datetime-local"
        name="scheduledTime"
        value={formData.scheduledTime}
        onChange={handleChange}
        required
      />

      <select name="airlineId" value={formData.airlineId} onChange={handleChange} required>
        <option value="">Select Airline</option>
        {dropdownData.airlines.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      <select name="aircraftId" value={formData.aircraftId} onChange={handleChange} required>
        <option value="">Select Aircraft</option>
        {dropdownData.aircrafts.map((a) => (
          <option key={a.id} value={a.id}>{a.model}</option>
        ))}
      </select>

      <select name="gateId" value={formData.gateId} onChange={handleChange} required>
        <option value="">Select Gate</option>
        {dropdownData.gates.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <select name="originAirportId" value={formData.originAirportId} onChange={handleChange} required>
        <option value="">Select Origin Airport</option>
        {dropdownData.airports.map((a) => (
          <option key={a.id} value={a.id}>{a.code}</option>
        ))}
      </select>

      <select name="destinationAirportId" value={formData.destinationAirportId} onChange={handleChange} required>
        <option value="">Select Destination Airport</option>
        {dropdownData.airports.map((a) => (
          <option key={a.id} value={a.id}>{a.code}</option>
        ))}
      </select>

      <button type="submit">Create Flight</button>
    </form>
  );
};

AddFlightForm.propTypes = {
  onFlightAdded: PropTypes.func.isRequired,
};

export default AddFlightForm;
