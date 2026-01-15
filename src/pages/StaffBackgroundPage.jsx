import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Users, PlusCircle, ClipboardCheck } from "lucide-react";

export default function StaffBackgroundPage() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
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

  /* 📥 Fetch Staff Background */
  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("staff_background")
        .select("*")
        .order("created_at", { ascending: true });

      setStaffData(data || []);
      setLoading(false);
    };

    fetchStaff();
  }, []);

  /* 🧠 Render list from array OR multiline text */
  const renderList = (value) => {
    if (!value) return <li>-</li>;
    const items = value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    return items.map((item, index) => <li key={index}>{item}</li>);
  };

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
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f8ff] font-poppins text-black">

      {/* HEADER */}
      <img src={IhcsHeader} alt="IHCS Header" className="w-full shadow-lg" />

      {/* ✅ ROLE-BASED NAVBAR */}
      {role === "staff" && <StaffNavbar />}
      {role === "client" && <ClientNavbar />}

      {/* CONTENT */}
      <main className="flex justify-center flex-1 p-6">
        <div style={cardStyle}>
          <div style={titleStyle}>
            <Users size={22} />
            Staff Background
          </div>

          {loading ? (
            <p className="p-8 font-semibold text-gray-600">Loading…</p>
          ) : staffData.length === 0 ? (
            <p className="p-8 font-semibold text-red-600">
              No staff background information available.
            </p>
          ) : (
            <div style={contentBox}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {staffData.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className="cursor-pointer bg-white rounded-3xl p-6
                               border-2 border-blue-500 shadow-lg
                               transition-all duration-300 hover:scale-105"
                  >
                    {staff.staff_photo_url ? (
                      <div className="w-40 h-40 mx-auto border-4 border-blue-600 shadow-lg rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center">
                        <img
                          src={staff.staff_photo_url}
                          alt={staff.staff_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 mx-auto rounded-2xl bg-blue-100
                                      flex items-center justify-center
                                      text-blue-700 font-bold text-4xl
                                      border-4 border-blue-600 shadow-lg">
                        {staff.staff_name.charAt(0)}
                      </div>
                    )}

                    <h3 className="mt-6 text-center font-bold text-lg text-blue-700">
                      {staff.staff_name}
                    </h3>
                    <p className="text-center text-sm font-semibold text-gray-500">
                      {staff.position || "Staff"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-[95%] max-w-4xl h-[90vh]
                          bg-gradient-to-br from-white via-blue-50 to-indigo-100
                          rounded-[36px] shadow-2xl border border-blue-300
                          flex flex-col overflow-hidden">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white/80 backdrop-blur
                            border-b border-blue-200 px-10 py-6
                            flex justify-between items-center">
              <div className="flex items-center gap-6">
                {selectedStaff.staff_photo_url ? (
                  <div className="w-40 h-40 border-4 border-blue-600 shadow-xl rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center">
                    <img
                      src={selectedStaff.staff_photo_url}
                      alt={selectedStaff.staff_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-blue-200
                                  flex items-center justify-center
                                  text-blue-700 font-bold text-4xl
                                  shadow-xl">
                    {selectedStaff.staff_name.charAt(0)}
                  </div>
                )}

                <div>
                  <h2 className="font-extrabold text-blue-800 text-2xl">
                    {selectedStaff.staff_name}
                  </h2>
                  <p className="text-lg font-semibold text-blue-600">
                    {selectedStaff.position || "Staff"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="text-red-500 text-2xl font-bold hover:text-red-700"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto px-12 py-10 space-y-8 text-base">
              <InfoBox title="Contact Information">
                {selectedStaff.contact_info || "-"}
              </InfoBox>

              <InfoBox title="Years of Experience">
                <ul className="list-disc pl-6 space-y-2">
                  {renderList(selectedStaff.years_of_experience)}
                </ul>
              </InfoBox>

              <InfoBox title="Highlights">
                <ul className="list-disc pl-6 space-y-2">
                  {renderList(selectedStaff.highlights)}
                </ul>
              </InfoBox>

              <InfoBox title="Background Summary">
                <p className="whitespace-pre-line leading-relaxed">
                  {selectedStaff.background_summary || "-"}
                </p>
              </InfoBox>
            </div>

            {/* MODAL FOOTER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600
                            text-white text-center py-4 text-sm font-semibold">
              IHCS • Staff Profile
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <img src={IhcsFooter} alt="IHCS Footer" className="w-full shadow-lg mt-auto" />
    </div>
  );
}

/* 🧩 Info Box */
function InfoBox({ title, children }) {
  return (
    <div className="bg-white/70 rounded-2xl p-6 border border-blue-200 shadow-sm">
      <h4 className="font-bold text-blue-700 mb-3 text-lg">{title}</h4>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

/* 🎨 Styles */
const cardStyle = {
  width: "900px",
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
