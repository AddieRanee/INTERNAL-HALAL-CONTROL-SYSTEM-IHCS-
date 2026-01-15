/**  ORGANISATIONAL CHART  */

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Building } from "lucide-react";

export default function OrganisationalChart() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userId: passedUserId,
    companyInfo: passedCompanyInfo,
    companyBackground: passedCompanyBackground,
    companyInfoId: passedCompanyInfoId,
  } = location.state || {};

  const [userId, setUserId] = useState(passedUserId || null);
  const [companyInfo, setCompanyInfo] = useState(passedCompanyInfo || null);
  const [companyInfoId, setCompanyInfoId] = useState(
    passedCompanyInfoId || passedCompanyInfo?.id || null
  );
  const [companyBackground, setCompanyBackground] = useState(
    passedCompanyBackground || null
  );
  const [orgChartId, setOrgChartId] = useState(null);

  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [directors, setDirectors] = useState("");
  const [managers, setManagers] = useState("");
  const [supervisors, setSupervisors] = useState("");
  const [employees, setEmployees] = useState("");
  const [muslimEmployees, setMuslimEmployees] = useState("");
  const [policyText, setPolicyText] = useState("");

  const [orgChartFile, setOrgChartFile] = useState(null);
  const [orgChartUrl, setOrgChartUrl] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) return;
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return navigate("/login");
      setUserId(data.user.id);
    };
    fetchUser();
  }, [userId, navigate]);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!userId || companyInfoId) return;

      const { data } = await supabase
        .from("company_info")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) return;

      setCompanyInfo(data);
      setCompanyInfoId(data.id);
      setCompanyName(data.company_name || "");
    };

    fetchCompanyInfo();
  }, [userId, companyInfoId]);

  useEffect(() => {
    const fetchOrgChart = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from("organisation_chart")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!data) return;

      setOrgChartId(data.id);

      setCompanyName(data.company_name ?? companyInfo?.company_name ?? "");
      setDirectors(data.directors ?? "");
      setManagers(data.managers ?? "");
      setSupervisors(data.supervisors ?? "");
      setEmployees(data.employees ?? "");
      setMuslimEmployees(data.muslim_employees ?? "");
      setPolicyText(data.policy_text ?? "");
      setOrgChartUrl(data.org_chart_url ?? "");

      setImplementationDate(data.implementation_date || "");
      setReferenceNo(data.reference_no || "");
      setReviewNo(data.review_no || "");
    };

    fetchOrgChart();
  }, [userId, companyInfo]);

  const handleFileUpload = async (file) => {
    if (!file || !userId) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/organisation_chart_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("ihcs-files")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("ihcs-files").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      alert("❌ Upload failed.");
      return null;
    }
  };

  const handleSaveAndContinue = async () => {
    if (!userId) return alert("User not authenticated.");

    const finalCompanyInfoId = companyInfoId || companyInfo?.id;
    if (!finalCompanyInfoId) return alert("Missing Company Info ID.");

    let uploadedFileUrl = orgChartUrl;
    if (orgChartFile) {
      const uploaded = await handleFileUpload(orgChartFile);
      if (uploaded) uploadedFileUrl = uploaded;
    }

    const payload = {
      user_id: userId,
      company_info_id: finalCompanyInfoId,
      company_name: companyName,
      implementation_date: implementationDate,
      reference_no: referenceNo,
      review_no: reviewNo,
      directors: directors ? parseInt(directors) : 0,
      managers: managers ? parseInt(managers) : 0,
      supervisors: supervisors ? parseInt(supervisors) : 0,
      employees: employees ? parseInt(employees) : 0,
      muslim_employees: muslimEmployees ? parseInt(muslimEmployees) : 0,
      policy_text: policyText,
      org_chart_url: uploadedFileUrl,
      updated_at: new Date().toISOString(),
    };

    try {
      if (orgChartId) {
        await supabase
          .from("organisation_chart")
          .update(payload)
          .eq("id", orgChartId);
      } else {
        const { data: inserted } = await supabase
          .from("organisation_chart")
          .insert(payload)
          .select()
          .single();

        setOrgChartId(inserted?.id);
      }

      alert("✅ Organisational Chart saved!");
      navigate("/halalpolicy", {
        state: { userId, companyInfo, companyInfoId, companyBackground },
      });
    } catch (err) {
      alert("❌ Error saving: " + err.message);
    }
  };

  const handleBack = () => navigate("/company-background");

  const handleNext = () =>
    navigate("/halalpolicy", {
      state: { userId, companyInfo, companyInfoId, companyBackground },
    });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setOrgChartFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setOrgChartUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div className="flex-1 flex flex-col">

{/* HEADER — UPDATED SIZE AND CURVE */}
<img
          src={IhcsHeader}
          alt="IHCS Header"
          className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
        />


        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <Link
            to="/"
            className="text-xs font-extrabold text-black tracking-wide no-underline hover:text-blue-600 transition-colors duration-300"
          >
            Home
          </Link>
        </nav>

        {/* CONTENT */}
        <main className="flex justify-center items-center flex-1 p-6">
          <div
            style={{
              width: "700px",
              maxWidth: "95vw",
              background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
              padding: "20px 22px 40px 22px",
              borderRadius: "48px",
              border: "4px solid #05014a",
              boxShadow: "0 8px 40px #0021f344",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* TITLE */}
            <div
              style={{
                paddingBottom: "20px",
                fontSize: "1.15rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "black",
              }}
            >
              <Building size={22} color="#05014a" />
              Organisational Chart
            </div>

            {/* TOPIC HEADER */}
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
                📘 Topic 2: Organisational Chart
              </h3>

              <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                This section records your company’s organisational structure and
                important document control details.
              </p>

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <LabeledInput
                  label="Implementation Date"
                  type="date"
                  value={implementationDate}
                  onChange={setImplementationDate}
                />

                <LabeledInput
                  label="Reference Number"
                  value={referenceNo}
                  onChange={setReferenceNo}
                />

                <LabeledInput
                  label="Review Number"
                  value={reviewNo}
                  onChange={setReviewNo}
                />
              </div>
            </div>

            {/* FORM */}
            <form
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <LabeledInput
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
              />

              <LabeledInput
                label="Number of Directors"
                type="number"
                value={directors}
                onChange={setDirectors}
              />

              <LabeledInput
                label="Number of Managers"
                type="number"
                value={managers}
                onChange={setManagers}
              />

              <LabeledInput
                label="Number of Supervisors"
                type="number"
                value={supervisors}
                onChange={setSupervisors}
              />

              <LabeledInput
                label="Number of Employees"
                type="number"
                value={employees}
                onChange={setEmployees}
              />

              <LabeledInput
                label="Number of Muslim Employees"
                type="number"
                value={muslimEmployees}
                onChange={setMuslimEmployees}
              />

              <label style={labelStyle}>
                Policy Text
                <textarea
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  style={textareaStyle}
                />
              </label>

              <label style={labelStyle}>
                Upload Organisational Chart
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ marginTop: "8px" }}
                />

                {orgChartUrl && (
                  <div style={{ marginTop: "10px" }}>
                    <p className="text-sm font-semibold mb-1">Preview:</p>
                    <img
                      src={orgChartUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        objectFit: "contain",
                        borderRadius: "10px",
                        border: "2px solid #05014a",
                      }}
                    />
                  </div>
                )}
              </label>

<button
  type="button"
  style={saveButtonStyle}
  onClick={handleSaveAndContinue}
>
  💾 Save & Continue ➡
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

       {/* FOOTER — UPDATED SIZE AND CURVE */}
<img
          src={IhcsFooter}
          alt="IHCS Footer"
          className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
        />
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

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
  width: "100%",
  marginTop: "4px",
  padding: "8px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  color: "black",
  outlineColor: "#2563eb",
  resize: "vertical",
  minHeight: "100px",
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
  padding: "14px 0",
  background: "linear-gradient(90deg,#6b7280 0%,#9ca3af 100%)",
  color: "#fff",
  border: "2px solid #374151",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 2px 14px #6b728055",
};

const nextButtonStyle = {
  flex: 1,
  padding: "14px 0",
  background: "linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)",
  color: "#fff",
  border: "2px solid #05014a",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 2px 14px #0021f355",
};
