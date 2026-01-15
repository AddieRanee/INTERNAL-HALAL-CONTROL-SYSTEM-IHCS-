// src/pages/CompanyBackground.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import React from "react";
import { Building } from "lucide-react"; // Icon

export default function CompanyBackground() {
  const navigate = useNavigate();
  const location = useLocation();

  const { userId: userIdFromState, companyInfo: companyInfoFromState } =
    location.state || {};

  const [userId, setUserId] = useState(userIdFromState || null);
  const [companyInfo, setCompanyInfo] = useState(companyInfoFromState || null);
  const [companyBackgroundId, setCompanyBackgroundId] = useState(null);

  // EXISTING FIELDS
  const [establishmentDetails, setEstablishmentDetails] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [managementEmployees, setManagementEmployees] = useState("");
  const [halalCertificationReason, setHalalCertificationReason] = useState("");
  const [premiseLocationMapUrl, setPremiseLocationMapUrl] = useState("");

  // NEW HEADER FIELDS
  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");
  const [documentName, setDocumentName] = useState("IHCS/HAS");

  // ---------------- AUTH ----------------
  useEffect(() => {
    const fetchUser = async () => {
      if (userIdFromState) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    fetchUser();
  }, [navigate, userIdFromState]);

  // ---------------- FETCH COMPANY INFO ----------------
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (companyInfo || !userId) return;

      const { data } = await supabase
        .from("company_info")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) setCompanyInfo(data);
    };

    fetchCompanyInfo();
  }, [userId, companyInfo]);

  // ---------------- PREFILL BACKGROUND ----------------
  useEffect(() => {
    const fetchBackground = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from("company_background")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setEstablishmentDetails(data.establishment_details || "");
        setMission(data.mission || "");
        setVision(data.vision || "");
        setBusinessActivity(data.business_activity || "");
        setManagementEmployees(data.management_employees || "");
        setHalalCertificationReason(data.halal_certification_reason || "");
        setPremiseLocationMapUrl(data.premise_location_map_url || "");

        // NEW FIELDS
        setImplementationDate(data.implementation_date || "");
        setReferenceNo(data.reference_no || "");
        setReviewNo(data.review_no || "");
        setDocumentName(data.document_name || "IHCS/HAS");

        setCompanyBackgroundId(data.id);
      }
    };
    fetchBackground();
  }, [userId]);

  // ---------------- SAVE FUNCTION ----------------
  const handleSave = async () => {
  if (!userId) return alert("❌ User not authenticated.");
  if (!companyInfo)
    return alert("❌ Missing Company Info. Save Company Info first.");

  const payload = {
    user_id: userId,
    establishment_details: establishmentDetails,
    mission,
    vision,
    business_activity: businessActivity,
    management_employees: managementEmployees,
    halal_certification_reason: halalCertificationReason,
    premise_location_map_url: premiseLocationMapUrl,
    implementation_date: implementationDate,
    reference_no: referenceNo,
    review_no: reviewNo,
    document_name: documentName,
  };

  if (companyBackgroundId) payload.id = companyBackgroundId;

  const { data, error } = await supabase
    .from("company_background")
    .upsert([payload], { onConflict: ["user_id"] })
    .select()
    .single();

  if (error) {
    console.error("Error saving:", error.message);
    return alert("❌ Error: " + error.message);
  }

  alert("✅ Company background saved successfully!");

  if (data?.id) setCompanyBackgroundId(data.id);

  // 👉 navigate AFTER successful save
  navigate("/organisationalchart", {
    state: {
      userId,
      companyInfo,
      companyBackground: data,
    },
  });
};
    const handleNext = () => {
  navigate("/organisationalchart", {
    state: {
      userId,
      companyInfo,
      companyBackground: {
        id: companyBackgroundId,
        establishment_details: establishmentDetails,
        mission,
        vision,
        business_activity: businessActivity,
        management_employees: managementEmployees,
        halal_certification_reason: halalCertificationReason,
        premise_location_map_url: premiseLocationMapUrl,
        implementation_date: implementationDate,
        reference_no: referenceNo,
        review_no: reviewNo,
        document_name: documentName,
      },
    },
  });
};

    const handleBack = () => {
      navigate("/companyinfo", { state: { userId, companyInfo } });
 };


  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src={IhcsHeader}
          alt="IHCS Header"
          className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
        />

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <div className="flex justify-start">
            <a
              href="/"
              className="text-xs font-extrabold text-black tracking-wide no-underline hover:text-blue-600 transition-colors duration-300 relative"
            >
              Home
            </a>
          </div>
        </nav>

        {/* MAIN */}
        <main className="flex justify-center items-center flex-1 p-6">
          <div
            style={{
              width: "700px",
              maxWidth: "95vw",
              background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
              padding: "20px 22px 40px 22px",
              borderRadius: "48px",
              border: "4px solid #05014a",
              boxShadow: "0 8px 40px #0021f344",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Heading */}
            <div
              style={{
                padding: "0 14px 20px 14px",
                fontSize: "1.15rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "black",
              }}
            >
              <Building size={22} color="#05014a" />
              Company Background
            </div>

            {/* TOPIC 1 */}
            <div
              style={{
                background: "#eef2ff",
                border: "2px solid #05014a",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  fontWeight: "700",
                  fontSize: "1rem",
                  color: "#05014a",
                  marginBottom: "8px",
                }}
              >
                📘 Topic 1: Company Background
              </h3>

              <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                This section records your company’s official information —
                including implementation date, document control details, and
                approvals — for documentation and traceability in the IHCS
                report.
              </p>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <label style={labelStyle}>
                  Implementation Date
                  <input
                    type="date"
                    style={inputStyle}
                    value={implementationDate}
                    onChange={(e) => setImplementationDate(e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Reference Number
                  <input
                    type="text"
                    placeholder="e.g. IHCS/COMP/2025/001"
                    style={inputStyle}
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Review Number
                  <input
                    type="text"
                    placeholder="e.g. IHCS/REV-01/2025"
                    style={inputStyle}
                    value={reviewNo}
                    onChange={(e) => setReviewNo(e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Document Name
                  <input
                    type="text"
                    style={inputStyle}
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* MAIN FORM */}
            <form
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {[
                {
                  label: "Establishment Details",
                  value: establishmentDetails,
                  setter: setEstablishmentDetails,
                  type: "textarea",
                },
                {
                  label: "Mission",
                  value: mission,
                  setter: setMission,
                  type: "textarea",
                },
                {
                  label: "Vision",
                  value: vision,
                  setter: setVision,
                  type: "textarea",
                },
                {
                  label: "Business Activity",
                  value: businessActivity,
                  setter: setBusinessActivity,
                  type: "textarea",
                },
                {
                  label: "Management & Employees",
                  value: managementEmployees,
                  setter: setManagementEmployees,
                  type: "textarea",
                },
                {
                  label: "Reason for Halal Certification",
                  value: halalCertificationReason,
                  setter: setHalalCertificationReason,
                  type: "textarea",
                },
                {
                  label: "Premise Location Map URL",
                  value: premiseLocationMapUrl,
                  setter: setPremiseLocationMapUrl,
                  type: "input",
                  inputType: "url",
                },
              ].map((field) => (
                <label key={field.label} style={labelStyle}>
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      style={textareaStyle}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.inputType}
                      style={inputStyle}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                    />
                  )}
                </label>
              ))}

              {/* SAVE BUTTON */}
              <button
                type="button"
                style={saveButtonStyle}
                onClick={handleSave}
              >
                💾 Save
              </button>

              {/* NAVIGATION */}
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  style={backButtonStyle}
                  onClick={handleBack}
                >
                  ⬅ Back
                </button>

                <button
                  type="button"
                  style={nextButtonStyle}
                  disabled={!userId || !companyInfo}
                  onClick={handleNext}
                >
                  ➡ Next
                </button>
              </div>
            </form>
          </div>
        </main>

        <img
          src={IhcsFooter}
          alt="IHCS Footer"
          className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
        />
      </div>

      {/* NAV STYLE */}
      <style>{`
        .nav-link-fancy {
          position: relative;
          padding: 0 12px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s, text-shadow 0.2s;
        }
        .nav-link-fancy:hover {
          color: #2563eb;
          text-shadow: 0 2px 16px #2563eb88;
        }
        .nav-link-fancy::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -6px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #05014a 0%, #0021f3 80%, #0013de 100%);
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .nav-link-fancy:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
}

// ---------------- STYLES ----------------
const labelStyle = {
  fontWeight: "600",
  display: "flex",
  flexDirection: "column",
  color: "black",
};

const inputStyle = {
  width: "100%",
  marginTop: "4px",
  padding: "8px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  color: "black",
  outlineColor: "#2563eb",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "60px",
};

const saveButtonStyle = {
  width: "100%",
  padding: "16px 0",
  background: "linear-gradient(90deg,#05014a 0%,#0021f3 100%)",
  color: "#fff",
  border: "2px solid #05014a",
  borderRadius: "13px",
  fontSize: "1.15rem",
  fontWeight: "600",
  marginTop: "24px",
  boxShadow: "0 2px 14px #0021f355",
  cursor: "pointer",
};

const backButtonStyle = {
  flex: 1,
  padding: "16px 0",
  background: "linear-gradient(90deg,#6b7280 0%,#9ca3af 100%)",
  color: "#fff",
  border: "2px solid #374151",
  borderRadius: "13px",
  fontSize: "1.15rem",
  fontWeight: "600",
  boxShadow: "0 2px 14px #6b728055",
  cursor: "pointer",
};

const nextButtonStyle = {
  flex: 1,
  padding: "16px 0",
  background: "linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)",
  color: "#fff",
  border: "2px solid #05014a",
  borderRadius: "13px",
  fontSize: "1.15rem",
  fontWeight: "600",
  boxShadow: "0 2px 14px #0021f355",
  cursor: "pointer",
};
