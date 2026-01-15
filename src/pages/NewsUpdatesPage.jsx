import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Newspaper, LogOut } from "lucide-react";

export default function NewsUpdatesPage({ onLogout }) {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  /* 🔐 Get user role */
  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(data?.role?.toLowerCase());
    };

    fetchRole();
  }, []);

  /* 📥 Fetch News */
  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news_updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setNewsList(data || []);
      setLoading(false);
    };

    fetchNews();
  }, []);

  /* 🔷 NAVBARS */
  const StaffNavbar = () => (
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

        <Link to="/staff-landing-dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>

        <button
          onClick={() => onLogout && onLogout(navigate)}
          className="flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );

  const ClientNavbar = () => (
    <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700 z-10">
      <span className="text-xl font-extrabold">IHCS</span>

      <div className="flex items-center gap-6 text-sm font-semibold">
        <Link to="/about-dashboard" className="hover:text-blue-600">
          About
        </Link>

        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>

        <button
          onClick={() => onLogout && onLogout(navigate)}
          className="flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f8ff] font-poppins text-black">
      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full shadow-lg"
      />

      {/* ✅ ROLE-BASED NAVBAR */}
      {role === "staff" && <StaffNavbar />}
      {role === "client" && <ClientNavbar />}

      {/* CONTENT */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div style={cardStyle}>
          <div style={titleStyle}>
            <Newspaper size={22} />
            News & Updates
          </div>

          {loading ? (
            <p className="p-8 font-semibold text-gray-600">Loading…</p>
          ) : newsList.length === 0 ? (
            <p className="p-8 font-semibold text-red-600">
              No news or updates available.
            </p>
          ) : (
            <div style={contentBox} className="space-y-6">
              {newsList.map((news) => (
                <div
                  key={news.id}
                  className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-blue-700">
                    {news.title || "Announcement"}
                  </h3>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                    {news.content}
                  </p>

                  {news.created_at && (
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(news.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full shadow-lg mt-auto"
      />
    </div>
  );
}

/* 🎨 STYLES */
const cardStyle = {
  width: "700px",
  maxWidth: "95vw",
  background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
  border: "4px solid #05014a",
  borderRadius: "48px",
  boxShadow: "0 8px 40px #0021f344",
  paddingBottom: "32px",
};

const titleStyle = {
  padding: "20px 36px 0",
  fontWeight: 600,
  fontSize: "1.15rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const contentBox = {
  marginTop: "24px",
  padding: "24px 36px",
};
