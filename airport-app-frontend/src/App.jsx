import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Airport from "./pages/Airport.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/airport/:airportId" element={<Airport />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
