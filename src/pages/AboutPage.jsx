import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Info } from "lucide-react";

export default function AboutPage() {
  const [aboutData, setAboutData] = useState(null);
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

  /* 📥 Fetch About content */
  useEffect(() => {
    const fetchAbout = async () => {
      const { data, error } = await supabase
        .from("about_kazai")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error) setAboutData(data);
      setLoading(false);
    };

    fetchAbout();
  }, []);

  /* 🔷 NAVBARS WITHOUT LOGOUT */
  const StaffNavbar = () => (
    <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700">
      <Link
        to="/staff-landing-dashboard"
        className="text-xl font-extrabold hover:text-blue-600 transition"
      >
        Staff Home
      </Link>

      <div className="flex items-center gap-6 text-sm font-semibold">
        <Link to="/about-dashboard" className="text-blue-600 font-bold">
          About
        </Link>

        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
      </div>
    </nav>
  );

  const ClientNavbar = () => (
    <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700">
      <span className="text-xl font-extrabold">IHCS</span>

      <div className="flex items-center gap-6 text-sm font-semibold">
        <Link to="/about-dashboard" className="text-blue-600 font-bold">
          About
        </Link>

        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f8ff] font-poppins text-black">
      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg"
      />

      {/* ✅ ROLE-BASED NAVBAR */}
      {role === "staff" && <StaffNavbar />}
      {role === "client" && <ClientNavbar />}

      {/* CONTENT */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div style={cardStyle}>
          <div style={titleStyle}>
            <Info size={22} />
            About Kazai
          </div>

          {loading ? (
            <p className="p-8 font-semibold text-gray-600">Loading…</p>
          ) : !aboutData ? (
            <p className="p-8 font-semibold text-red-600">
              No About information available.
            </p>
          ) : (
            <>
              {aboutData.logo_url && (
                <div className="flex justify-center mt-6">
                  <img
                    src={aboutData.logo_url}
                    alt="Organization Logo"
                    className="h-24 object-contain"
                  />
                </div>
              )}

              <div style={contentBox}>
                <h2 className="text-xl font-bold text-blue-700 mb-3 text-center">
                  {aboutData.about_title}
                </h2>

                <p className="text-gray-700 text-justify leading-relaxed whitespace-pre-line">
                  {aboutData.about_description}
                </p>
              </div>
            </>
          )}
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
