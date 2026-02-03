import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Clock, CheckCircle, XCircle, Info, LogOut } from "lucide-react";

export default function WelcomePage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch user & status
  useEffect(() => {
    const fetchAccessStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("no_user");
        setLoading(false);
        return;
      }

      setUser(user);

      // Get latest access request
      const { data, error } = await supabase
        .from("access_requests")
        .select("status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching status:", error);
        setStatus("error");
      } else if (!data) {
        // ✅ Auto-create pending request
        const { error: insertError } = await supabase
          .from("access_requests")
          .insert([{ user_id: user.id, status: "pending" }]);

        if (insertError) {
          console.error("Error creating default request:", insertError);
          setStatus("error");
        } else {
          setStatus("pending");
        }
      } else {
        setStatus(data.status?.toLowerCase() || "none");
      }

      setLoading(false);
    };

    fetchAccessStatus();
  }, []);

  // ✅ Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("access-status-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "access_requests" },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setStatus(payload.new.status?.toLowerCase() || "pending");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ✅ Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      alert("❌ Failed to log out. Please try again.");
    } else {
      alert("👋 You have been logged out successfully.");
      navigate("/auth");
    }
  };

  // ✅ Status display
  const renderNotice = () => {
    if (loading) return null;

    switch (status) {
      case "pending":
        return (
          <div className="flex items-center justify-center gap-3 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-xl py-3 px-5 text-sm font-medium shadow-md mt-8">
            <Clock size={18} /> Your access request is pending admin approval.
          </div>
        );

      case "approved":
        return (
          <div className="flex flex-col items-center justify-center gap-3 bg-green-50 text-green-700 border border-green-300 rounded-xl py-3 px-5 text-sm font-medium shadow-md mt-8">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} /> Your access has been approved!
            </div>
            <p className="text-sm mt-1">
              You can now access and fill out the IHCS company form.
            </p>
          </div>
        );

      case "rejected":
        return (
          <div className="flex items-center justify-center gap-3 bg-red-50 text-red-700 border border-red-300 rounded-xl py-3 px-5 text-sm font-medium shadow-md mt-8">
            <XCircle size={18} /> Your request was rejected. Please contact the
            admin.
          </div>
        );

      case "no_user":
        return (
          <div className="flex items-center justify-center gap-3 bg-gray-50 text-gray-700 border border-gray-300 rounded-xl py-3 px-5 text-sm font-medium shadow-md mt-8">
            <Info size={18} /> Please log in to view your access status.
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center gap-3 bg-blue-50 text-blue-700 border border-blue-300 rounded-xl py-3 px-5 text-sm font-medium shadow-md mt-8">
            <Info size={18} /> You haven’t submitted any access request yet.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#16192c] font-poppins overflow-y-auto">
      {/* ✅ Header */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg"
      />
        {/* ✅ Navbar */}
        <nav
          className="flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700 relative z-10"
          style={{
            borderImage:
              "linear-gradient(90deg, #2563eb 0%, #3b82f6 80%, #60a5fa 100%) 1",
          }}
        >
          {/* 🔷 Logo / Title */}
          <span
            className="text-xl font-extrabold text-[#16192c] tracking-wide"
            style={{ userSelect: "none" }}
          >
            IHCS
          </span>

          {/* 🔗 Only About Link */}
          <div className="flex items-center gap-5 text-sm font-semibold tracking-wide text-[#16192c]">
            <Link to="/about-dashboard" className="nav-link-fancy">
                About
              </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-red-600 transition-all duration-200"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </nav>

      {/* ✅ Hero Section */}
      <section
        className="flex flex-col items-center justify-center px-8 py-20 text-center relative"
        style={{
          background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
          backdropFilter: "blur(12px)",
          border: "4px solid #05014a",
          borderRadius: "48px",
          boxShadow: "0 8px 40px #0021f344",
          width: "800px",
          maxWidth: "95vw",
          margin: "40px auto 201px auto",
          padding: "40px 30px",
        }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 leading-snug tracking-wide drop-shadow-sm">
          Welcome Client
        </h1>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 leading-snug tracking-wide drop-shadow-sm">
          Internal Halal Control System
        </h1>

        <p className="text-base md:text-lg max-w-3xl mb-6 font-medium leading-relaxed tracking-wide">
          This Internal Halal Control System (IHCS) web form enables companies
          to key in essential halal compliance information. All data entered can
          later be exported into a printable document.
        </p>

        <p className="italic text-base md:text-lg mb-6 max-w-2xl font-medium leading-relaxed tracking-wide">
          "Towards a more systematic and confident halal assurance process."
        </p>

        <p className="text-base md:text-lg max-w-3xl mb-6 font-medium leading-relaxed tracking-wide">
          Ensure your company maintains halal compliance with ease and
          confidence. Streamline your processes, track your materials, and
          generate reports seamlessly.
        </p>

        {/* ✅ Status Message */}
        {renderNotice()}

        {/* ✅ Button logic */}
        {status?.toLowerCase() === "approved" ? (
          <Link to="/companyinfo" className="fancy-btn mt-10">
            Get Started
          </Link>
        ) : (
          <Link to="/request-access" className="fancy-btn mt-10">
            Request Access
          </Link>
        )}

        <p className="mt-4 text-sm italic text-gray-500">
          (Access required to use company information forms)
        </p>
      </section>

      {/* ✅ Footer */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg"
      />

      {/* ✅ Styles */}
      <style>{`
        .nav-link-fancy {
          position: relative;
          color: #16192c;
          text-decoration: none;
          transition: color 0.3s ease, text-shadow 0.3s ease;
          padding: 0 10px;
          font-weight: 600;
        }
        .nav-link-fancy:hover {
          color: #2563eb;
          text-shadow: 0 0 8px #2563eb;
        }
        .nav-link-fancy::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -6px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #2563eb 0%, #3b82f6 80%, #60a5fa 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: left;
        }
        .nav-link-fancy:hover::after {
          transform: scaleX(1);
        }

        .fancy-btn {
          display: inline-block;
          background: linear-gradient(90deg, #2563eb 0%, #3b82f6 80%, #60a5fa 100%);
          color: white;
          font-size: 1.125rem;
          font-weight: 700;
          padding: 0.75rem 3rem;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.6);
          cursor: pointer;
          user-select: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          text-align: center;
        }
        .fancy-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 8px 3px rgba(59, 130, 246, 0.7),
            0 4px 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
