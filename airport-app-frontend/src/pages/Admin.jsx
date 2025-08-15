import React, { useEffect, useState } from "react";
import axios from "axios";
import FlightTable from "../components/FlightTable";

const Admin = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [form, setForm] = useState({
    flightNumber: "",
    airline: "",
    aircraft: "",
    departureTime: "",
    arrivalTime: "",
    origin: "",
    destination: "",
    status: "ON_TIME",
    flightType: "DEPARTURE",
    gate: "",
    terminalNumber: "",
    passengerCapacity: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFlights = async () => {
      try {
        const res = await axios.get("http://localhost:8080/admin/flights");

        if (isMounted) {
          
          const flightData = Array.isArray(res.data) ? res.data : [];
          
          const normalized = flightData.map((f) => {
            console.log("Processing flight:", f); 
            console.log("airlineName:", f.airlineName, "originCode:", f.originCode, "destinationCode:", f.destinationCode);
            return {
              id: f.id,
              flightNumber: f.flightNumber,
              airline: f.airlineName || "No Airline",
              aircraft: f.aircraftType || "",
              status: f.status,
              flightType: f.flightType,
              scheduledTime: f.scheduledTime,
              origin: f.originCode || "No Origin",
              destination: f.destinationCode || "No Destination",
              departureTime: f.scheduledTime,
              arrivalTime: f.scheduledTime,
              gate: f.gateNumber || "",
              terminalNumber: f.terminalNumber || "",
              passengerCapacity: f.passengerCapacity || "",
            };
          });

          console.log("Fetched flights data:", flightData); 
          if (flightData.length > 0) {
            console.log("First flight object:", flightData[0]); 
            console.log("All keys in first flight:", Object.keys(flightData[0])); 
          }
          console.log("Normalized flights:", normalized); 
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

    const fetchDropdownData = async () => {
      try {
        // Fetch airports
        const airportsRes = await axios.get("http://localhost:8080/airports");
        if (isMounted && airportsRes.data) {
          setAirports(Array.isArray(airportsRes.data) ? airportsRes.data : []);
        }

        // Set common airlines (could be fetched from backend in real app)
        if (isMounted) {
          setAirlines([
            "Air Canada",
            "WestJet",
            "Porter Airlines",
            "Air Transat",
            "Flair Airlines",
            "Sunwing Airlines",
            "Canadian North",
            "Air North",
          ]);
        }

        // Set common aircraft types (could be fetched from backend in real app)
        if (isMounted) {
          setAircraftTypes([
            "Airbus A220-100",
            "Airbus A220-300",
            "Airbus A319",
            "Airbus A320",
            "Airbus A321",
            "Airbus A330-300",
            "Boeing 737-700",
            "Boeing 737-800",
            "Boeing 737-900",
            "Boeing 737 MAX 8",
            "Boeing 767-300",
            "Boeing 777-200",
            "Boeing 777-300ER",
            "Boeing 787-8",
            "Boeing 787-9",
            "Bombardier CRJ-200",
            "Bombardier CRJ-900",
            "Bombardier Q400",
            "Embraer E175",
            "Embraer E190",
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };

    fetchFlights();
    fetchDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Functions to save new entries to backend
  const saveNewAirline = async (airlineName) => {
    try {
      const response = await axios.post('http://localhost:8080/airlines', {
        name: airlineName
      });
      if (response.data) {
        setAirlines([...airlines, airlineName]);
        console.log(`New airline "${airlineName}" saved successfully`);
      }
    } catch (error) {
      console.error('Failed to save new airline:', error);
    }
  };

  const saveNewAircraft = async (aircraftType) => {
    try {
      const response = await axios.post('http://localhost:8080/aircraft-types', {
        type: aircraftType
      });
      if (response.data) {
        setAircraftTypes([...aircraftTypes, aircraftType]);
        console.log(`New aircraft type "${aircraftType}" saved successfully`);
      }
    } catch (error) {
      console.error('Failed to save new aircraft type:', error);
    }
  };

  const saveNewAirport = async (airportCode, airportName) => {
    try {
      const response = await axios.post('http://localhost:8080/airports', {
        code: airportCode.toUpperCase(),
        name: airportName
      });
      if (response.data) {
        const newAirport = { id: response.data.id, code: airportCode.toUpperCase(), name: airportName };
        setAirports([...airports, newAirport]);
        console.log(`New airport "${airportCode} - ${airportName}" saved successfully`);
      }
    } catch (error) {
      console.error('Failed to save new airport:', error);
    }
  };

  // Handle custom input for dropdowns
  const handleCustomInput = async (fieldName, value) => {
    if (!value || value.trim() === '') return;

    if (fieldName === 'airline') {
      const exists = airlines.includes(value);
      if (!exists) {
        await saveNewAirline(value);
      }
    } else if (fieldName === 'aircraft') {
      const exists = aircraftTypes.includes(value);
      if (!exists) {
        await saveNewAircraft(value);
      }
    } else if (fieldName === 'origin' || fieldName === 'destination') {
      // For airports, check if it's a new airport code
      const exists = airports.some(airport => airport.code === value.toUpperCase());
      if (!exists && value.length >= 3) {
        // Prompt for airport name if it's a new code
        const airportName = prompt(`Enter the name for airport ${value.toUpperCase()}:`);
        if (airportName && airportName.trim()) {
          await saveNewAirport(value, airportName.trim());
        }
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.flightNumber.trim()) {
      errors.push("Flight number is required");
    } else if (!/^[A-Z]{2,3}\d{1,4}$/.test(form.flightNumber.trim())) {
      errors.push("Flight number must be in format like AC101 or WS1234");
    }
    
    if (!form.airline.trim()) {
      errors.push("Airline is required");
    }
    
    if (!form.origin.trim()) {
      errors.push("Origin airport is required");
    }
    
    if (!form.destination.trim()) {
      errors.push("Destination airport is required");
    }
    
    if (form.origin === form.destination) {
      errors.push("Origin and destination cannot be the same");
    }
    
    if (!form.departureTime) {
      errors.push("Departure time is required");
    }
    
    if (form.passengerCapacity && (isNaN(form.passengerCapacity) || parseInt(form.passengerCapacity) < 1)) {
      errors.push("Passenger capacity must be a positive number");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(""); 
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrMsg(validationErrors.join(". "));
      return;
    }
    
    try {
      
      const payload = {
        flightNumber: form.flightNumber,
        flightType: form.flightType,
        status: form.status,
        scheduledTime: form.departureTime,
        airlineName: form.airline,
        aircraft: form.aircraft,
        originCode: form.origin,
        destinationCode: form.destination,
        gate: form.gate,
        terminalNumber: form.terminalNumber,
        passengerCapacity: form.passengerCapacity ? parseInt(form.passengerCapacity) : null,
      };

      console.log("Submitting payload:", payload); 

      if (editingId) {
        const res = await axios.put(
          `http://localhost:8080/admin/flights/${editingId}`,
          payload
        );
        const updated = {
          id: res.data.id,
          flightNumber: res.data.flightNumber,
          airline: res.data.airlineName || form.airline,
          origin: res.data.originCode || form.origin,
          destination: res.data.destinationCode || form.destination,
          departureTime: res.data.scheduledTime,
          arrivalTime: res.data.scheduledTime,
        };
        setFlights(flights.map((f) => (f.id === editingId ? updated : f)));
        setEditingId(null);
      } else {
        const res = await axios.post("http://localhost:8080/admin/flights/simple", payload);
        console.log("Server response:", res.data); 
        
        const added = {
          id: res.data.id,
          flightNumber: res.data.flightNumber,
          airline: res.data.airlineName || payload.airline,
          origin: res.data.originCode || payload.origin,
          destination: res.data.destinationCode || payload.destination,
          departureTime: res.data.scheduledTime,
          arrivalTime: res.data.scheduledTime,
          status: res.data.status,
          flightType: res.data.flightType,
        };
        setFlights([...flights, added]);
      }

      
      setForm({
        flightNumber: "",
        airline: "",
        aircraft: "",
        departureTime: "",
        arrivalTime: "",
        origin: "",
        destination: "",
        status: "ON_TIME",
        flightType: "DEPARTURE",
        gate: "",
        terminalNumber: "",
        passengerCapacity: "",
      });
      
      setErrMsg(""); 
    } catch (error) {
      console.error("Flight save error:", error);
      
      
      if (error.response) {
        
        const message = error.response.data?.message || error.response.data || "Server error occurred";
        setErrMsg(`Failed to save flight: ${message}`);
      } else if (error.request) {
        
        setErrMsg("Network error: Could not connect to server");
      } else {
        
        setErrMsg("Failed to save flight: " + error.message);
      }
    }
  };

  const handleEdit = (flight) => {
    setForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      aircraft: flight.aircraft || "",
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      origin: flight.origin,
      destination: flight.destination,
      status: flight.status || "ON_TIME",
      flightType: flight.flightType || "DEPARTURE",
      gate: flight.gate || "",
      terminalNumber: flight.terminalNumber || "",
      passengerCapacity: flight.passengerCapacity || "",
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

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#3b82f6";
    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "#e5e7eb";
    e.target.style.boxShadow = "none";
  };

  const setQuickDateTime = (hours) => {
    const now = new Date();
    now.setHours(hours, 0, 0, 0);
    const isoString = now.toISOString().slice(0, 16);
    return isoString;
  };

  const handleQuickTime = (field, hours) => {
    const dateTime = setQuickDateTime(hours);
    setForm({ ...form, [field]: dateTime });
  };

  const handleDateSelect = (field, selectedDate) => {
    
    const existingDateTime = form[field] ? new Date(form[field]) : new Date();
    const newDate = new Date(selectedDate);
    
    
    newDate.setHours(existingDateTime.getHours() || 9);
    newDate.setMinutes(existingDateTime.getMinutes() || 0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    const isoString = newDate.toISOString().slice(0, 16);
    setForm({ ...form, [field]: isoString });
  };

  const getQuickDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    
    return [
      { label: "Today", date: today },
      { label: "Tomorrow", date: tomorrow },
      { label: "Day After", date: dayAfter },
    ];
  };


  return (
    <div style={outerWrapper}>
      <div style={mainContainer}>
        <div style={headerSection}>
          <h1 style={heading}>Flight Administration</h1>
          <p style={subheading}>Manage flight schedules and information</p>
        </div>

        {errMsg && (
          <div style={errorAlert}>
            <span style={errorIcon}>⚠️</span>
            {errMsg}
          </div>
        )}

        <div style={formCard}>
          <h2 style={sectionTitle}>
            {editingId ? "Edit Flight" : "Add New Flight"}
          </h2>
          
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={formGrid}>
              <div style={inputWrapper}>
                <label htmlFor="flightNumber" style={label}>Flight Number</label>
                <input 
                  id="flightNumber"
                  name="flightNumber" 
                  placeholder="e.g., AC101" 
                  value={form.flightNumber} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required 
                />
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="airline" style={label}>Airline</label>
                <input 
                  id="airline"
                  name="airline" 
                  value={form.airline} 
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleInputBlur(e);
                    handleCustomInput('airline', e.target.value);
                  }}
                  placeholder="Select or enter airline name..."
                  list="airlines-list"
                  style={input}
                  onFocus={handleInputFocus}
                  required 
                />
                <datalist id="airlines-list">
                  {airlines.map((airline) => (
                    <option key={airline} value={airline} />
                  ))}
                </datalist>
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="origin" style={label}>Origin Airport</label>
                <input 
                  id="origin"
                  name="origin" 
                  value={form.origin} 
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleInputBlur(e);
                    handleCustomInput('origin', e.target.value);
                  }}
                  placeholder="Select or enter airport code..."
                  list="airports-list"
                  style={input}
                  onFocus={handleInputFocus}
                  required 
                />
                <datalist id="airports-list">
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.code}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </datalist>
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="destination" style={label}>Destination Airport</label>
                <input 
                  id="destination"
                  name="destination" 
                  value={form.destination} 
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleInputBlur(e);
                    handleCustomInput('destination', e.target.value);
                  }}
                  placeholder="Select or enter airport code..."
                  list="airports-list-dest"
                  style={input}
                  onFocus={handleInputFocus}
                  required 
                />
                <datalist id="airports-list-dest">
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.code}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </datalist>
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="aircraft" style={label}>Aircraft</label>
                <input 
                  id="aircraft"
                  name="aircraft" 
                  value={form.aircraft} 
                  onChange={handleChange}
                  onBlur={(e) => {
                    handleInputBlur(e);
                    handleCustomInput('aircraft', e.target.value);
                  }}
                  placeholder="Select or enter aircraft type..."
                  list="aircraft-list"
                  style={input}
                  onFocus={handleInputFocus}
                />
                <datalist id="aircraft-list">
                  {aircraftTypes.map((aircraft) => (
                    <option key={aircraft} value={aircraft} />
                  ))}
                </datalist>
              </div>

              <div style={inputWrapper}>
                <label htmlFor="status" style={label}>Status</label>
                <select 
                  id="status"
                  name="status" 
                  value={form.status} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                >
                  <option value="ON_TIME">On Time</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="BOARDING">Boarding</option>
                  <option value="DEPARTED">Departed</option>
                </select>
              </div>

              <div style={inputWrapper}>
                <label htmlFor="flightType" style={label}>Flight Type</label>
                <select 
                  id="flightType"
                  name="flightType" 
                  value={form.flightType} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                >
                  <option value="DEPARTURE">Departure</option>
                  <option value="ARRIVAL">Arrival</option>
                </select>
              </div>

              <div style={inputWrapper}>
                <label htmlFor="gate" style={label}>Gate</label>
                <input 
                  id="gate"
                  name="gate" 
                  placeholder="e.g., A12" 
                  value={form.gate} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputWrapper}>
                <label htmlFor="terminalNumber" style={label}>Terminal</label>
                <input 
                  id="terminalNumber"
                  name="terminalNumber" 
                  placeholder="e.g., 1" 
                  value={form.terminalNumber} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputWrapper}>
                <label htmlFor="passengerCapacity" style={label}>Passenger Capacity</label>
                <input 
                  id="passengerCapacity"
                  name="passengerCapacity" 
                  type="number"
                  placeholder="e.g., 180" 
                  value={form.passengerCapacity} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  min="1"
                />
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="departureTime" style={label}>Departure Time</label>
                <input 
                  id="departureTime"
                  name="departureTime" 
                  type="datetime-local" 
                  value={form.departureTime} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required 
                />
                <div style={quickOptionsContainer}>
                  <div style={quickDateSection}>
                    <span style={quickLabel}>Quick Dates:</span>
                    <div style={quickDateButtons}>
                      {getQuickDates().map((dateOption) => (
                        <button 
                          key={dateOption.label}
                          type="button" 
                          onClick={() => handleDateSelect('departureTime', dateOption.date)} 
                          style={quickDateBtn}
                        >
                          {dateOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={quickTimeSection}>
                    <span style={quickLabel}>Quick Times:</span>
                    <div style={quickTimeButtons}>
                      <button type="button" onClick={() => handleQuickTime('departureTime', 6)} style={quickTimeBtn}>6 AM</button>
                      <button type="button" onClick={() => handleQuickTime('departureTime', 9)} style={quickTimeBtn}>9 AM</button>
                      <button type="button" onClick={() => handleQuickTime('departureTime', 12)} style={quickTimeBtn}>12 PM</button>
                      <button type="button" onClick={() => handleQuickTime('departureTime', 15)} style={quickTimeBtn}>3 PM</button>
                      <button type="button" onClick={() => handleQuickTime('departureTime', 18)} style={quickTimeBtn}>6 PM</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={inputWrapper}>
                <label htmlFor="arrivalTime" style={label}>Arrival Time</label>
                <input 
                  id="arrivalTime"
                  name="arrivalTime" 
                  type="datetime-local" 
                  value={form.arrivalTime} 
                  onChange={handleChange} 
                  style={input}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required 
                />
                <div style={quickOptionsContainer}>
                  <div style={quickDateSection}>
                    <span style={quickLabel}>Quick Dates:</span>
                    <div style={quickDateButtons}>
                      {getQuickDates().map((dateOption) => (
                        <button 
                          key={dateOption.label}
                          type="button" 
                          onClick={() => handleDateSelect('arrivalTime', dateOption.date)} 
                          style={quickDateBtn}
                        >
                          {dateOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={quickTimeSection}>
                    <span style={quickLabel}>Quick Times:</span>
                    <div style={quickTimeButtons}>
                      <button type="button" onClick={() => handleQuickTime('arrivalTime', 8)} style={quickTimeBtn}>8 AM</button>
                      <button type="button" onClick={() => handleQuickTime('arrivalTime', 11)} style={quickTimeBtn}>11 AM</button>
                      <button type="button" onClick={() => handleQuickTime('arrivalTime', 14)} style={quickTimeBtn}>2 PM</button>
                      <button type="button" onClick={() => handleQuickTime('arrivalTime', 17)} style={quickTimeBtn}>5 PM</button>
                      <button type="button" onClick={() => handleQuickTime('arrivalTime', 20)} style={quickTimeBtn}>8 PM</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={buttonGroup}>
              <button type="submit" style={primaryButton}>
                {editingId ? "Update Flight" : "Add Flight"}
              </button>
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
                  style={secondaryButton}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={tableCard}>
          <h2 style={sectionTitle}>Flight Schedule</h2>
          {loading ? (
            <div style={loadingState}>
              <div style={spinner}></div>
              <p>Loading flights...</p>
            </div>
          ) : (
            <FlightTable flights={flights} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

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

const headerSection = {
  textAlign: "center",
  marginBottom: "24px",
};

const heading = {
  fontSize: "3rem",
  fontWeight: "700",
  color: "white",
  margin: "0 0 16px 0",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const subheading = {
  fontSize: "1.2rem",
  color: "rgba(255, 255, 255, 0.9)",
  margin: "0",
  fontWeight: "400",
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

const formCard = {
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
};

const tableCard = {
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
  gap: "8px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const inputWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const label = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "4px",
};

const input = {
  padding: "12px 16px",
  fontSize: "14px",
  border: "2px solid #e5e7eb",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  background: "white",
  color: "#1f2937",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

const buttonGroup = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  paddingTop: "8px",
};

const primaryButton = {
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
};

const secondaryButton = {
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "8px",
  background: "#f3f4f6",
  color: "#6b7280",
  border: "none",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const loadingState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 20px",
  gap: "16px",
};

const spinner = {
  width: "32px",
  height: "32px",
  border: "3px solid #e5e7eb",
  borderTop: "3px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const quickTimeButtons = {
  display: "flex",
  gap: "6px",
  marginTop: "8px",
  flexWrap: "wrap",
};

const quickTimeBtn = {
  padding: "4px 8px",
  fontSize: "11px",
  fontWeight: "500",
  borderRadius: "4px",
  background: "#f3f4f6",
  color: "#6b7280",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  transition: "background 0.2s ease, color 0.2s ease",
  ":hover": {
    background: "#e5e7eb",
    color: "#374151",
  },
};

const quickOptionsContainer = {
  marginTop: "12px",
  padding: "12px",
  background: "#f9fafb",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const quickDateSection = {
  marginBottom: "12px",
};

const quickTimeSection = {
  marginBottom: "0",
};

const quickLabel = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "6px",
  display: "block",
};

const quickDateButtons = {
  display: "flex",
  gap: "6px",
  marginTop: "6px",
  flexWrap: "wrap",
};

const quickDateBtn = {
  padding: "6px 12px",
  fontSize: "12px",
  fontWeight: "500",
  borderRadius: "6px",
  background: "#e0f2fe",
  color: "#0369a1",
  border: "1px solid #bae6fd",
  cursor: "pointer",
  transition: "background 0.2s ease, color 0.2s ease",
  ":hover": {
    background: "#bae6fd",
    color: "#0c4a6e",
  },
};



export default Admin;
