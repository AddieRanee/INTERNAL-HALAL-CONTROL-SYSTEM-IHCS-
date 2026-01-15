import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

/* ✅ Reset Password */
import ResetPassword from "./pages/ResetPassword";

/* 🛠️ Admin Add Pages */
import AddAbout from "./pages/AddAbout";
import AddOurService from "./pages/AddOurService";
import AddHalalCourse from "./pages/AddHalalCourse";
import AddWeProvide from "./pages/AddWeProvide";
import AddNewsUpdates from "./pages/AddNewsUpdates";
import AddStaffBackground from "./pages/AddStaffBackground";

/* 📘 Public Pages */
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

/* 🔒 AuthRoute */
function AuthRoute({ user, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return !user ? children : null;
}

/* 🔐 ProtectedRoute */
function ProtectedRoute({ allowed, redirectTo = "/auth", element }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!allowed) navigate(redirectTo, { replace: true });
  }, [allowed, navigate, redirectTo]);

  return allowed ? element : null;
}

/* 🔁 RootRedirect */
function RootRedirect({ user, role }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/auth", { replace: true });
    else if (role === "staff")
      navigate("/staff-landing-dashboard", { replace: true });
    else if (role === "client")
      navigate("/dashboard", { replace: true });
  }, [user, role, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting…</p>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  /* ✅ LOGOUT HANDLER (ADDED) */
  const handleLogout = async (navigate) => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate("/auth", { replace: true });
  };

  /* 🧭 Sidebar visibility */
  const hideSidebarOn = [
    "/auth",
    "/request-access",
    "/staff-landing-dashboard",
    "/about-dashboard",
    "/staff-status-update",
    "/staff-background",
    "/staff-add-info",
    "/add-about",
    "/add-our-service",
    "/add-halal-course",
    "/add-we-provide",
    "/add-news-updates",
    "/add-staff-background",
    "/reset-password",
  ];

  const companyPages = [
    "/companyinfo",
    "/Company-Background",
    "/halalpolicy",
    "/organisationalchart",
    "/premiseplan",
    "/ProductFlowChartRaw",
    "/productflowprocess",
    "/productlist",
    "/rawmaterialmaster",
    "/rawmaterialsummary",
    "/traceability",
  ];

  const shouldShowSidebar =
    user &&
    ((role === "client" && !hideSidebarOn.includes(location.pathname)) ||
      companyPages.includes(location.pathname));

  /* 🧠 Session + role (WITH LISTENER) */
useEffect(() => {
  const fetchUserAndRole = async (session) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      setRole(profile?.role?.trim().toLowerCase() ?? null);
    } else {
      setRole(null);
    }

    setLoading(false);
  };

  // Initial load (refresh-safe)
  supabase.auth.getSession().then(({ data }) => {
    fetchUserAndRole(data.session);
  });

  // Auth change listener (login / logout)
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      setLoading(true);
      await fetchUserAndRole(session);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {shouldShowSidebar && <Sidebar />}

      <main className="flex-1 min-h-screen w-full overflow-y-auto bg-gray-50">
        <Routes>

          {/* 🔑 Auth */}
          <Route path="/auth" element={<AuthRoute user={user}><Auth /></AuthRoute>} />
          <Route path="/request-access" element={<RequestAccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 🧑‍💼 Staff */}
          <Route
            path="/staff-landing-dashboard"
            element={
              <ProtectedRoute
                allowed={!!user && role === "staff"}
                element={<StaffDashboardLanding onLogout={handleLogout} />}
              />
            }
            
          />
          <Route path="/about-dashboard" element={<AboutDashboard />} />
          <Route path="/staff-add-info" element={<ProtectedRoute allowed={!!user && role === "staff"} element={<StaffAddInfo />} />} />
          <Route path="/staff-background" element={<ProtectedRoute allowed={!!user && role === "staff"} element={<StaffBackgroundPage />} />} />
          <Route path="/staff-status-update" element={<ProtectedRoute allowed={!!user && role === "staff"} element={<StaffStatusUpdate />} />} />

          {/* 🛠️ Admin */}
          <Route path="/add-about" element={<AddAbout />} />
          <Route path="/add-our-service" element={<AddOurService />} />
          <Route path="/add-halal-course" element={<AddHalalCourse />} />
          <Route path="/add-we-provide" element={<AddWeProvide />} />
          <Route path="/add-news-updates" element={<AddNewsUpdates />} />
          <Route path="/add-staff-background" element={<AddStaffBackground />} />

          {/* 🌍 Public Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/halal-courses" element={<HalalCoursePage />} />
          <Route path="/we-provide" element={<WeProvidePage />} />
          <Route path="/news" element={<NewsUpdatesPage />} />
          <Route path="/staff-background-public" element={<StaffBackgroundPage />} />

          {/* ✅ AboutDashboard URL support */}
          <Route path="/about/services" element={<ServicePage />} />
          <Route path="/about/halal-course" element={<HalalCoursePage />} />
          <Route path="/about/we-provide" element={<WeProvidePage />} />
          <Route path="/about/news-updates" element={<NewsUpdatesPage />} />
          <Route path="/about/staff-background" element={<StaffBackgroundPage />} />

          {/* 🏢 Company */}
          <Route path="/companyinfo" element={<CompanyInfo />} />
          <Route path="/Company-Background" element={<CompanyBackground />} />
          <Route path="/halalpolicy" element={<HalalPolicy />} />
          <Route path="/organisationalchart" element={<OrganisationalChart />} />
          <Route path="/premiseplan" element={<PremisePlan />} />
          <Route path="/ProductFlowChartRaw" element={<ProductFlowChartRaw />} />
          <Route path="/productflowprocess" element={<ProductFlowProcess />} />
          <Route path="/productlist" element={<ProductList />} />
          <Route path="/rawmaterialmaster" element={<RawMaterialMaster />} />
          <Route path="/rawmaterialsummary" element={<RawMaterialSummary />} />
          <Route path="/traceability" element={<Traceability />} />

          {/* 🧍 Client */}
          <Route path="/dashboard" element={<ProtectedRoute allowed={!!user && role === "client"} element={<WelcomePage />} />} />

          {/* 🔁 Root */}
          <Route path="/" element={<RootRedirect user={user} role={role} />} />

          {/* ❌ 404 */}
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