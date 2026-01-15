import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

const menuItems = [
  { name: "Company Info", path: "/companyinfo" },
  { name: "Company Background", path: "/Company-Background" },
  { name: "Organisational Chart", path: "/organisationalchart" },
  { name: "Halal Policy", path: "/halalpolicy" },
  { name: "Product List", path: "/productlist" },
  { name: "Raw Material Master", path: "/rawmaterialmaster" },
  { name: "Raw Material Summary", path: "/rawmaterialsummary" },
  { name: "Product Flow Chart Raw", path: "/ProductFlowChartRaw" },
  { name: "Product Flow Process", path: "/productflowprocess" },
  { name: "Premise Plan", path: "/premiseplan" },
  { name: "Traceability", path: "/traceability" },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <aside
      style={{
        width: sidebarOpen ? 280 : 60,
        backgroundColor: "#121212",
        padding: sidebarOpen ? "1.5rem" : "1.5rem 0.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "white",
        transition: "width 0.3s ease, padding 0.3s ease",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: sidebarOpen ? 16 : 0,
          marginBottom: 32,
          justifyContent: sidebarOpen ? "flex-start" : "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#ef4444",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          IHCS
        </div>
        {sidebarOpen && <h2 style={{ fontSize: 20, fontWeight: 700 }}>IHCS Sections</h2>}
      </div>

      {/* Menu */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
        {menuItems.map(({ name, path }, index) => (
          <NavLink
            key={index}
            to={path}
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#2563eb" : "#1e293b",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: sidebarOpen ? 12 : 0,
              padding: sidebarOpen ? "12px 16px" : "12px 8px",
              color: "white",
              textDecoration: "none",
              justifyContent: sidebarOpen ? "flex-start" : "center",
            })}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                backgroundColor: "#2563eb",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 600,
              }}
            >
              {index + 1}
            </div>
            {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>}
          </NavLink>
        ))}

        {/* Toggle Sidebar */}
        <div
          style={{
            display: "flex",
            justifyContent: sidebarOpen ? "flex-end" : "center",
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "white",
              cursor: "pointer",
            }}
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {sidebarOpen && (
          <div style={{ color: "#64748b", fontSize: 12, textAlign: "right" }}>
            Powered by <span style={{ color: "#3b82f6", fontWeight: 600 }}>Kazai</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
