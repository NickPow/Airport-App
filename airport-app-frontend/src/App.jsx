import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Home from "./pages/Home.jsx";
import Airport from "./pages/Airport.jsx";
import Admin from "./pages/Admin.jsx";
import Flights from "./pages/Flights.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/airports/:id" element={<Airport />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
