import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

/* 📄 Pages */
import WelcomePage from "./pages/WelcomePage";
import StaffDashboardLanding from "./pages/StaffDashboardLanding";
import AboutDashboard from "./pages/AboutDashboard";
import StaffBackgroundPage from "./pages/StaffBackgroundPage";
import StaffStatusUpdate from "./pages/StaffStatusUpdate";
import Auth from "./pages/Auth";
import RequestAccess from "./pages/RequestAccess";
import StaffAddInfo from "./pages/AddInfoDashboard";
import ResetPassword from "./pages/ResetPassword";

/* 🛠️ Admin Pages */
import AddAbout from "./pages/AddAbout";
import AddOurService from "./pages/AddOurService";
import AddHalalCourse from "./pages/AddHalalCourse";
import AddWeProvide from "./pages/AddWeProvide";
import AddNewsUpdates from "./pages/AddNewsUpdates";
import AddStaffBackground from "./pages/AddStaffBackground";

/* 🌍 Public Pages */
import AboutPage from "./pages/AboutPage";
import ServicePage from "./pages/ServicePage";
import HalalCoursePage from "./pages/HalalCoursePage";
import WeProvidePage from "./pages/WeProvidePage";
import NewsUpdatesPage from "./pages/NewsUpdatesPage";

/* 🏢 Company Pages */
import CompanyBackground from "./pages/CompanyBackground";
import CompanyInfo from "./pages/CompanyInfo";
import HalalPolicy from "./pages/HalalPolicy";
import OrganisationalChart from "./pages/OrganisationalChart";
import PremisePlan from "./pages/PremisePlan";
import ProductFlowChartRaw from "./pages/ProductFlowChartRaw";
import ProductFlowProcess from "./pages/ProductFlowProcess";
import ProductList from "./pages/ProductList";
import RawMaterialMaster from "./pages/RawMaterialMaster";
import RawMaterialSummary from "./pages/RawMaterialSummary";
import Traceability from "./pages/Traceability";

/* 🧱 Components */
import Sidebar from "./components/Sidebar";


/* ================================================= */
/* ================= APP ============================ */
/* ================================================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [clientApproved, setClientApproved] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();


  /* =================================================
     🔥 Fetch user + role + staff approval
     (single source of truth for whole app)
  ================================================= */
  const fetchUserAndRole = async (session) => {
    setRoleLoading(true);
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (!currentUser) {
      setRole(null);
      setClientApproved(false);
      setRoleLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, staff_approved")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error || !profile) {
      console.error("Profile fetch failed:", error);
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setClientApproved(false);
      setRoleLoading(false);
      navigate("/auth", { replace: true });
      return;
    }

    const cleanRole = profile.role?.trim()?.toLowerCase();

    // 🚫 block unapproved staff globally
    if (cleanRole === "staff" && !profile.staff_approved) {
      await supabase.auth.signOut();
      setRole(null);
      setClientApproved(false);
      setRoleLoading(false);
      return;
    }

    setRole(cleanRole);
    if (cleanRole === "client") {
      const { data: access, error: accessError } = await supabase
        .from("access_requests")
        .select("status, created_at")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (accessError) {
        console.error("Access request fetch failed:", accessError);
        setClientApproved(false);
      } else {
        setClientApproved((access?.status || "").toLowerCase() === "approved");
      }
    } else {
      setClientApproved(false);
    }
    setRoleLoading(false);
  };


  /* =================================================
     🔥 Global Auth Listener (NO refresh needed ever)
  ================================================= */
  useEffect(() => {
  let mounted = true;

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!mounted) return;

    setUser(data.session?.user ?? null);

    if (data.session?.user) {
      fetchUserAndRole(data.session);
    } else {
      setRole(null);
      setClientApproved(false);
      setRoleLoading(false);
    }

    setLoading(false);
  };

  init();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAndRole(session);
      } else {
        setRole(null);
        setClientApproved(false);
        setRoleLoading(false);
      }
    }
  );

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    if (!user || role !== "client") return;

    const channel = supabase
      .channel("client-access-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_requests" },
        (payload) => {
          if (payload.new?.user_id === user.id) {
            const status = (payload.new.status || "").toLowerCase();
            setClientApproved(status === "approved");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  /* =================================================
     Logout
  ================================================= */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setClientApproved(false);
  };


  /* =================================================
     Sidebar rules
  ================================================= */
  const hideSidebarOn = [
    "/auth",
    "/request-access",
    "/reset-password",
  ];

  const shouldShowSidebar =
    user &&
    role === "client" &&
    clientApproved &&
    !hideSidebarOn.includes(location.pathname);


  /* =================================================
     Loading screen
  ================================================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Initializing session…</p>
      </div>
    );
  }


  /* =================================================
     Route Guards
  ================================================= */
  const RequireAuth = ({ allowedRole, children }) => {
    if (!user) return <Navigate to="/auth" replace />;
    if (allowedRole && roleLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading profileâ€¦</p>
        </div>
      );
    }
    if (allowedRole && role !== allowedRole) return <Navigate to="/auth" replace />;
    return children;
  };

  const RequireClientApproved = ({ children }) => {
    if (!user) return <Navigate to="/auth" replace />;
    if (roleLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading profileÃ¢â‚¬Â¦</p>
        </div>
      );
    }
    if (role !== "client") return <Navigate to="/auth" replace />;
    if (!clientApproved) {
      return (
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="max-w-xl w-full bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold mb-2">Access Pending Approval</h2>
            <p className="text-sm">
              Your request has not been approved yet. Please wait for approval
              or email kazai if you believe this is an error.
            </p>
          </div>
        </div>
      );
    }
    return children;
  };

  const RedirectLoggedIn = ({ children }) => {
    if (user) {
      if (roleLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-600">Loading profileâ€¦</p>
          </div>
        );
      }
      return (
        <Navigate
          to={role === "staff" ? "/staff-landing-dashboard" : "/dashboard"}
          replace
        />
      );
    }
    return children;
  };


  /* =================================================
     Routes
  ================================================= */
  return (
    <div className="flex min-h-screen w-full">

      {shouldShowSidebar && <Sidebar />}

      <main className="flex-1 min-h-screen w-full overflow-y-auto bg-gray-50">
        <Routes>

          {/* Auth */}
          <Route path="/auth" element={<RedirectLoggedIn><Auth /></RedirectLoggedIn>} />
          <Route path="/request-access" element={<RequestAccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Staff */}
          <Route path="/staff-landing-dashboard" element={
            <RequireAuth allowedRole="staff">
              <StaffDashboardLanding onLogout={handleLogout} />
            </RequireAuth>
          } />

          <Route path="/staff-add-info" element={<RequireAuth allowedRole="staff"><StaffAddInfo /></RequireAuth>} />
          <Route path="/staff-background" element={<RequireAuth><StaffBackgroundPage /></RequireAuth>} />
          <Route path="/staff-status-update" element={<RequireAuth allowedRole="staff"><StaffStatusUpdate /></RequireAuth>} />

          {/* Shared (Client + Staff) */}
          <Route path="/about-dashboard" element={<RequireAuth><AboutDashboard /></RequireAuth>} />

          {/* Admin */}
          <Route path="/add-about" element={<AddAbout />} />
          <Route path="/add-our-service" element={<AddOurService />} />
          <Route path="/add-halal-course" element={<AddHalalCourse />} />
          <Route path="/add-we-provide" element={<AddWeProvide />} />
          <Route path="/add-news-updates" element={<AddNewsUpdates />} />
          <Route path="/add-staff-background" element={<AddStaffBackground />} />

          {/* Public */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/halal-courses" element={<HalalCoursePage />} />
          <Route path="/we-provide" element={<WeProvidePage />} />
          <Route path="/news" element={<NewsUpdatesPage />} />

          {/* Company */}
          <Route path="/companyinfo" element={<RequireClientApproved><CompanyInfo /></RequireClientApproved>} />
          <Route path="/Company-Background" element={<RequireClientApproved><CompanyBackground /></RequireClientApproved>} />
          <Route path="/halalpolicy" element={<RequireClientApproved><HalalPolicy /></RequireClientApproved>} />
          <Route path="/organisationalchart" element={<RequireClientApproved><OrganisationalChart /></RequireClientApproved>} />
          <Route path="/premiseplan" element={<RequireClientApproved><PremisePlan /></RequireClientApproved>} />
          <Route path="/ProductFlowChartRaw" element={<RequireClientApproved><ProductFlowChartRaw /></RequireClientApproved>} />
          <Route path="/productflowprocess" element={<RequireClientApproved><ProductFlowProcess /></RequireClientApproved>} />
          <Route path="/productlist" element={<RequireClientApproved><ProductList /></RequireClientApproved>} />
          <Route path="/rawmaterialmaster" element={<RequireClientApproved><RawMaterialMaster /></RequireClientApproved>} />
          <Route path="/rawmaterialsummary" element={<RequireClientApproved><RawMaterialSummary /></RequireClientApproved>} />
          <Route path="/traceability" element={<RequireClientApproved><Traceability /></RequireClientApproved>} />

          {/* Client */}
          <Route path="/dashboard" element={<RequireAuth allowedRole="client"><WelcomePage /></RequireAuth>} />

          {/* Root */}
          <Route
            path="/"
            element={
              <Navigate
                to={user ? (role === "staff" ? "/staff-landing-dashboard" : "/dashboard") : "/auth"}
                replace
              />
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold">404 – Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}






//AboutPage.jsx
//ServicePage.jsx
//HalalCoursePage.jsx
//WeProvidePage.jsx
//NewsUpdatesPage.jsx
//StaffBackgroundPage.jsx



//AddAbout.jsx
//AddHalalCourse.jsx
//AddInfoDashboard.jsx
//AddNewsUpdates.jsx
//AddNewsUpdates.jsx
//AddOurService.jsx
//AddStaffBackground.jsx
//AddWeProvide.jsx

//CompanyBackground.jsx /company-background
//CompanyInfo.jsx /companyinfo
//HalalPolicy.jsx /halalpolicy
//OrganisationalChart.jsx /organisationalchart
//PremisePlan.jsx /premiseplan
//ProductFlowChartRaw.jsx /ProductFlowChartRaw
//ProductFlowProcess.jsx /productflowprocess
//ProductList.jsx /productlist
//RawMaterialMaster.jsx /rawmaterialmaster
//RawMaterialSummary.jsx /rawmaterialsummary
//Traceability.jsx /traceability



// mysparktrack@gmail.com
// maddiemike03@gmail.com
// m-6147680@moe-dl.edu.my
