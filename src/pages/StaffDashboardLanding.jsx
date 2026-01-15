// src/pages/StaffDashboardLanding.jsx
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle, ClipboardCheck } from "lucide-react";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";

export default function StaffDashboardLanding({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-[#16192c] font-poppins overflow-y-auto">

      {/* Header */}
      <div className="relative w-full">
        <img
          src={IhcsHeader}
          alt="IHCS Header"
          className="w-full h-auto object-cover shadow-lg pointer-events-none"
        />
      </div>

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700 z-10">
        <Link
          to="/staff-landing-dashboard"
          className="text-xl font-extrabold hover:text-blue-600 transition"
        >
          Staff Home
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold">

          {/* About */}
          <Link to="/about-dashboard" className="hover:text-blue-600">
            About
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          {/* Status Update */}
          <Link
            to="/staff-status-update"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <ClipboardCheck size={18} />
            Status Update
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          {/* Add Info */}
          <Link
            to="/staff-add-info"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <PlusCircle size={20} />
            Add Info
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          {/* Logout */}
          <button
            onClick={() => onLogout(navigate)}
            className="text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <section className="flex flex-col items-center justify-center px-8 py-20 text-center bg-white shadow rounded-lg mx-6 mt-6">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6">
          Staff Dashboard – IHCS
        </h1>

        <p className="text-base md:text-lg mb-10 max-w-2xl text-gray-700">
          Welcome to the IHCS staff portal. You can update staff status,
          manage information, and monitor IHCS workflows here.
        </p>

        {/* Quick Actions */}
        <div className="flex gap-6">
          <Link
            to="/staff-status-update"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Update Status
          </Link>

          <Link
            to="/about-dashboard"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition"
          >
            About
          </Link>
        </div>
      </section>

      {/* Footer */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg mt-auto pointer-events-none"
      />
    </div>
  );
}
