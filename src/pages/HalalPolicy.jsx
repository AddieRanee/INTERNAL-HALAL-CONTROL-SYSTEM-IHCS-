// src/pages/HalalPolicy.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import React from "react";
import { ScrollText } from "lucide-react"; // ⭐ ADDED ICON

export default function HalalPolicy() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userId: passedUserId,
    companyInfo: passedCompanyInfo,
    companyBackground: passedCompanyBackground,
    organisationalChart: passedOrganisationalChart,
  } = location.state || {};

  const [userId, setUserId] = useState(passedUserId || null);
  const [companyInfo, setCompanyInfo] = useState(passedCompanyInfo || null);
  const [companyBackground, setCompanyBackground] = useState(passedCompanyBackground || null);
  const [organisationalChart, setOrganisationalChart] = useState(passedOrganisationalChart || null);
  const [companyInfoId, setCompanyInfoId] = useState(null);
  const [halalPolicyId, setHalalPolicyId] = useState(null);

  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  const [policyPoints, setPolicyPoints] = useState([""]);
  const [directorName, setDirectorName] = useState("");
  const [directorDesignation, setDirectorDesignation] = useState("");
  const [approvalDate, setApprovalDate] = useState("");

  const [justSavedAndNavigated, setJustSavedAndNavigated] = useState(false);

  // ---------------- AUTH ----------------
  useEffect(() => {
    if (userId) return;
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate("/login");
      setUserId(user.id);
    };
    fetchUser();
  }, [userId, navigate]);

  // ---------------- FETCH COMPANY INFO ----------------
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from("company_info")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) return navigate("/companyinfo");

      setCompanyInfo(data);
      setCompanyInfoId(data.id);
    };

    if (!companyInfoId) fetchCompanyInfo();
  }, [userId, companyInfoId, navigate]);

  // ---------------- FETCH EXISTING HALAL POLICY ----------------
  useEffect(() => {
    const fetchPolicy = async () => {
      if (!companyInfoId) return;

      const { data } = await supabase
        .from("halal_policy")
        .select("*")
        .eq("company_info_id", companyInfoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPolicyPoints(Array.isArray(data.policy_points) && data.policy_points.length ? data.policy_points : [""]);
        setDirectorName(data.director_name ?? "");
        setDirectorDesignation(data.director_designation ?? "");
        setApprovalDate(data.approval_date ?? "");
        setImplementationDate(data.implementation_date ?? "");
        setReferenceNo(data.reference_no ?? "");
        setReviewNo(data.review_no ?? "");
        setHalalPolicyId(data.id ?? null);
      }
    };

    fetchPolicy();
  }, [companyInfoId]);

  // ---------------- SAVE FUNCTION ----------------
  const handleSave = async (opts = { navigateAfter: false }) => {
    try {
      const payload = {
        company_info_id: companyInfoId,
        policy_points: policyPoints.filter((p) => p.trim() !== ""),
        director_name: directorName || null,
        director_designation: directorDesignation || null,
        approval_date: approvalDate || null,
        implementation_date: implementationDate || null,
        reference_no: referenceNo || null,
        review_no: reviewNo || null,
        user_id: userId,
      };

      const { data } = await supabase
        .from("halal_policy")
        .upsert([payload], { onConflict: ["company_info_id"] })
        .select()
        .maybeSingle();

      const savedPolicy = data || payload;
      setHalalPolicyId(savedPolicy?.id ?? halalPolicyId);

      if (opts.navigateAfter) {
        setJustSavedAndNavigated(true);
        navigate("/productlist", {
          state: {
            userId,
            companyInfo,
            companyBackground,
            organisationalChart,
            halalPolicy: savedPolicy,
            companyInfoId,
            halalPolicyId: savedPolicy?.id ?? halalPolicyId,
          },
        });
      }

      return savedPolicy;
    } catch {
      return null;
    }
  };

  // ---------------- AUTO-SAVE ----------------
  useEffect(() => {
    if (!companyInfoId || !userId) return;
    if (justSavedAndNavigated) {
      const reset = setTimeout(() => setJustSavedAndNavigated(false), 800);
      return () => clearTimeout(reset);
    }

    const timeout = setTimeout(() => {
      handleSave({ navigateAfter: false });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    directorName,
    directorDesignation,
    approvalDate,
    policyPoints,
    implementationDate,
    referenceNo,
    reviewNo,
    companyInfoId,
    userId,
  ]);

  // ---------------- NEXT ----------------
  const handleNext = async () => {
    const saved = await handleSave({ navigateAfter: false });
    navigate("/productlist", {
      state: {
        userId,
        companyInfo,
        companyBackground,
        organisationalChart,
        halalPolicy: saved,
        companyInfoId,
      },
    });
  };

  // ---------------- BACK ----------------
  const handleBack = () => {
    navigate("/organisationalchart", {
      state: {
        userId,
        companyInfo,
        companyBackground,
        organisationalChart,
      },
    });
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img src={IhcsHeader} alt="IHCS Header" className="w-full h-auto object-cover shadow-lg rounded-b-3xl" />

        {/* NAV BAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <Link to="/" className="text-xs font-extrabold text-black tracking-wide hover:text-blue-600 no-underline">
            Home
          </Link>
        </nav>

        <main className="flex items-center justify-center flex-1 p-6">
          <div
            className="relative"
            style={{
              width: "700px",
              maxWidth: "95vw",
              background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
              border: "4px solid #05014a",
              borderRadius: "48px",
              boxShadow: "0 8px 40px #0021f344",
              padding: "20px 22px 40px 22px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ⭐ UPDATED TITLE WITH LUCIDE ICON */}
            <div
              style={{
                padding: "0 14px 20px 14px",
                fontWeight: "600",
                fontSize: "1.15rem",
                color: "black",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ScrollText size={22} color="#05014a" />
              Fill up the Halal Policy
            </div>

            {/* Topic Box */}
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
                📘 Topic 3: Halal Policy
              </h3>

              <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                This section records your company’s Halal Policy and important document control details.
              </p>

              <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                    style={inputStyle}
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Review Number
                  <input
                    type="text"
                    style={inputStyle}
                    value={reviewNo}
                    onChange={(e) => setReviewNo(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Form */}
            <form
              className="flex-1"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <label style={labelStyle}>
                Policy Points
                {policyPoints.map((point, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <textarea
                      style={{ ...inputStyle, flex: 1, resize: "vertical", minHeight: "50px" }}
                      value={point}
                      onChange={(e) => {
                        const next = [...policyPoints];
                        next[idx] = e.target.value;
                        setPolicyPoints(next);
                      }}
                      placeholder={`Policy point #${idx + 1}`}
                      rows={2}
                    />
                    <button
                      type="button"
                      style={removeButtonStyle}
                      onClick={() =>
                        setPolicyPoints(
                          policyPoints.filter((_, i) => i !== idx).length
                            ? policyPoints.filter((_, i) => i !== idx)
                            : [""]
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" style={addButtonStyle} onClick={() => setPolicyPoints([...policyPoints, ""])}>
                  + Add Policy Point
                </button>
              </label>

              <label style={labelStyle}>
                Director Name
                <input type="text" style={inputStyle} value={directorName} onChange={(e) => setDirectorName(e.target.value)} />
              </label>

              <label style={labelStyle}>
                Director Designation
                <input
                  type="text"
                  style={inputStyle}
                  value={directorDesignation}
                  onChange={(e) => setDirectorDesignation(e.target.value)}
                />
              </label>

              <label style={labelStyle}>
                Approval Date
                <input type="date" style={inputStyle} value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} />
              </label>

              <button
                type="button"
                style={saveButtonStyle}
                onClick={async () => {
                  const result = await handleSave({ navigateAfter: true });
                  if (!result) return;
                }}
              >
                💾 Save & Continue
              </button>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" style={backButtonStyle} onClick={handleBack}>
                  ⬅ Back
                </button>
                <button type="button" style={nextButtonStyle} onClick={handleNext}>
                  ➡ Next
                </button>
              </div>
            </form>
          </div>
        </main>

        <img src={IhcsFooter} alt="IHCS Footer" className="w-full h-auto object-cover shadow-lg rounded-t-3xl" />
      </div>
    </div>
  );
}

/* Styles */
const labelStyle = { fontWeight: "600", display: "flex", flexDirection: "column", color: "black" };
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
const removeButtonStyle = {
  background: "#ff4d4d",
  border: "none",
  color: "white",
  fontWeight: "700",
  borderRadius: "8px",
  cursor: "pointer",
  padding: "6px 10px",
};
const addButtonStyle = {
  marginTop: "10px",
  padding: "8px 12px",
  background: "#0021f3",
  color: "white",
  borderRadius: "13px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
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
