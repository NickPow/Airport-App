import React from "react";

export default function FlightTable({ title, flights }) {
  return (
    <div style={{ marginTop: 16, marginBottom: 32 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>

      {flights.length === 0 ? (
        <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
          No flights found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Flight #</th>
                <th style={th}>Airline</th>
                <th style={th}>Aircraft</th>
                <th style={th}>Gate</th>
                <th style={th}>Status</th>
                <th style={th}>Type</th>
                <th style={th}>Scheduled</th>
                <th style={th}>Origin</th>
                <th style={th}>Destination</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={td}>{f.flightNumber}</td>
                  <td style={td}>{f.airline?.name || "-"}</td>
                  <td style={td}>{f.aircraft?.type || "-"}</td>
                  <td style={td}>{f.gate?.gateNumber || "-"}</td>
                  <td style={td}>{f.status || "-"}</td>
                  <td style={td}>{f.flightType || "-"}</td>
                  <td style={td}>{f.scheduledTime?.replace("T", " ").split(".")[0] || "-"}</td>
                  <td style={td}>{f.origin?.name || f.origin?.code || "-"}</td>
                  <td style={td}>{f.destination?.name || f.destination?.code || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 8px",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e5e7eb",
};

const td = {
  padding: "8px",
  whiteSpace: "nowrap",
};
