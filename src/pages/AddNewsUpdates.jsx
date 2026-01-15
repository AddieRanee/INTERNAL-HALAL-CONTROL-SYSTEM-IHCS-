// src/pages/AddNewsUpdates.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Newspaper, PlusCircle, ClipboardCheck } from "lucide-react";

export default function AddNewsUpdates({ onLogout }) {
  const navigate = useNavigate();
  const [newsText, setNewsText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Submitted News / Updates:", newsText);

    setTimeout(() => {
      alert("📰 News / Updates saved!");
      setNewsText("");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f8ff] font-poppins text-black">

      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg"
      />

      {/* NAVBAR (same as others) */}
      <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700 z-10">
        <Link
          to="/staff-landing-dashboard"
          className="text-xl font-extrabold hover:text-blue-600 transition"
        >
          Staff Home
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/about-dashboard" className="hover:text-blue-600">
            About
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <Link
            to="/staff-status-update"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <ClipboardCheck size={18} />
            Status Update
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <Link
            to="/staff-add-info"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            <PlusCircle size={18} />
            Add Info
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <button
            onClick={() => onLogout && onLogout(navigate)}
            className="text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* FORM */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div style={cardStyle}>

          {/* TITLE */}
          <div style={titleStyle}>
            <Newspaper size={22} />
            News & Updates
          </div>

          {/* NOTE */}
          <div style={{ padding: "0 36px", marginTop: "12px" }}>
            <div style={noteStyle}>
              Add announcements, company updates, or important news related
              to halal compliance and organizational activities.
            </div>
          </div>

          {/* FORM CONTENT */}
          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={labelStyle}>
              News / Update Content
              <textarea
                style={{ ...inputStyle, height: "160px", resize: "none" }}
                placeholder="Enter news or updates…"
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              style={saveButtonStyle}
              disabled={loading || !newsText.trim()}
            >
              {loading ? "Saving…" : "📝 Save Update"}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg mt-auto"
      />
    </div>
  );
}

/* 🎨 Styles */
const cardStyle = {
  width: "700px",
  maxWidth: "95vw",
  background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
  border: "4px solid #05014a",
  borderRadius: "48px",
  boxShadow: "0 8px 40px #0021f344",
  paddingBottom: "24px",
};

const titleStyle = {
  padding: "20px 36px 0",
  fontWeight: 600,
  fontSize: "1.15rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const noteStyle = {
  background: "linear-gradient(135deg,#dbe7ff,#bcd4ff)",
  border: "2px solid #0021f3",
  borderRadius: "18px",
  padding: "14px",
  fontWeight: 600,
};

const formStyle = {
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const labelStyle = {
  fontWeight: 600,
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontFamily: "inherit",
};

const saveButtonStyle = {
  marginTop: "18px",
  padding: "16px 0",
  background: "linear-gradient(90deg,#05014a,#0021f3)",
  color: "#fff",
  borderRadius: "13px",
  fontWeight: 600,
  cursor: "pointer",
};
