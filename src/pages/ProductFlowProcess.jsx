// src/pages/ProductFlowProcess.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Workflow } from "lucide-react";
import supabase from '../supabaseClient';
import BackgroundWeb from '../assets/BackgroundWeb.png';
import IhcsHeader from '../assets/IHCS_header_pic.png';
import IhcsFooter from '../assets/IHCS_Footer_pic.png';

export default function ProductFlowProcess({ companyInfoId: propCompanyId, onBack, onNext }) {
  const navigate = useNavigate();
  const location = useLocation();
  const companyInfoId = propCompanyId || location.state?.companyInfoId;

  const [flowchartImageUrl, setFlowchartImageUrl] = useState(null);
  const [flowchartImageFile, setFlowchartImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // NEW STATES – Standardized across all pages
  const [implementationDate, setImplementationDate] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [reviewNo, setReviewNo] = useState('');

  const safeDate = (value) => (value && value !== "" ? value : null);

  // Fetch existing data
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!companyInfoId) return;

      const { data, error } = await supabase
        .from('product_flow_process')
        .select('*')
        .eq('company_info_id', companyInfoId)
        .single();

      if (data) {
        setDescription(data.description || '');
        setFlowchartImageUrl(data.flowchart_image_url || null);
        setImplementationDate(data.implementation_date || '');
        setReferenceNo(data.reference_no || '');
        setReviewNo(data.review_no || '');
      }

      if (error && error.code !== 'PGRST116') console.error(error);
    };

    fetchExistingData();
  }, [companyInfoId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFlowchartImageFile(file);
    setFlowchartImageUrl(URL.createObjectURL(file));
  };

  // SAVE FUNCTION
  const saveData = async () => {
    if (!companyInfoId) {
      alert("Missing company ID — cannot save.");
      return false;
    }

    try {
      setLoading(true);
      let publicUrl = flowchartImageUrl;

      // Upload new image
      if (flowchartImageFile) {
        const ext = flowchartImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `flow_process/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ihcs-files')
          .upload(filePath, flowchartImageFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from('ihcs-files')
          .getPublicUrl(filePath);

        publicUrl = publicData.publicUrl;
      }

      const { data: existingData } = await supabase
        .from('product_flow_process')
        .select('id')
        .eq('company_info_id', companyInfoId)
        .single();

      const payload = {
        implementation_date: safeDate(implementationDate),
        reference_no: referenceNo || null,
        review_no: reviewNo || null,
        description,
        flowchart_image_url: publicUrl,
      };

      if (existingData) {
        await supabase
          .from('product_flow_process')
          .update(payload)
          .eq('company_info_id', companyInfoId);
      } else {
        await supabase
          .from('product_flow_process')
          .insert([{ company_info_id: companyInfoId, ...payload }]);
      }

      alert("✅ Product Flow Process saved!");
      return true;

    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.message);
      return false;

    } finally {
      setLoading(false);
    }
  };

  const handleSaveContinue = async () => {
    const success = await saveData();
    if (success) navigate("/premiseplan", { state: { companyInfoId } });
  };

  const handleBackBtn = () => {
    if (onBack) onBack();
    else navigate("/ProductFlowChartRaw", { state: { companyInfoId } });
  };

  const handleNextBtn = () => {
    if (onNext) onNext();
    else navigate("/premiseplan", { state: { companyInfoId } });
  };

  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: `url(${BackgroundWeb})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* HEADER */}
        <img src={IhcsHeader} className="w-full h-auto object-cover shadow-lg rounded-b-3xl" alt="" />

        {/* NAV — CLEANED (Home only) */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <Link to="/" className="text-xs font-extrabold text-black hover:text-blue-600">
            Home
          </Link>
          <div></div>
        </nav>

        {/* MAIN */}
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
              <Workflow size={22} color="#05014a" />
              Product Flow Process
            </div>

            {/* TOPIC HEADER SECTION */}
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
                📘 Topic 8: Product Flow Process
              </h3>

              <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
                This section records your company’s product flow process and important
                document control details.
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

            {/* IMAGE UPLOAD */}
            <label style={labelStyle}>
              Flow Process Image
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: "8px" }} />
            </label>

            {flowchartImageUrl && (
              <div style={previewBoxStyle}>
                <img
                  src={flowchartImageUrl}
                  alt="Process"
                  style={{ width: "100%", height: "auto", borderRadius: "12px" }}
                />
              </div>
            )}

            {/* DESCRIPTION */}
            <label style={labelStyle}>
              Description
              <textarea
                style={textareaStyle}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </label>

            {/* BUTTONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
              <button
                type="button"
                style={saveContinueButtonStyle}
                onClick={handleSaveContinue}
                disabled={loading}
              >
                {loading ? "Saving..." : "💾 Save & Continue"}
              </button>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" style={backButtonStyle} onClick={handleBackBtn}>⬅ Back</button>
                <button type="button" style={nextButtonStyle} onClick={handleNextBtn}>➡ Next</button>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <img src={IhcsFooter} className="w-full h-auto object-cover rounded-t-3xl shadow-lg" alt="" />
      </div>

      {/* NAV LINK HOVER STYLE */}
      <style>{`
        .nav-link-fancy {
          position: relative;
          color: black;
          text-decoration: none;
          padding: 0 12px;
          font-weight: 600;
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
          background: linear-gradient(90deg, #05014a 0%, #0021f3 80%);
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

// Shared styles
const labelStyle = {
  fontWeight: "600",
  display: "flex",
  flexDirection: "column",
  color: "black",
};

const inputStyle = {
  marginTop: "4px",
  padding: "8px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  color: "black",
};

const textareaStyle = {
  marginTop: "4px",
  padding: "8px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  color: "black",
  resize: "vertical",
};

const previewBoxStyle = {
  marginTop: "12px",
  border: "2px solid #05014a",
  borderRadius: "16px",
  padding: "8px",
  maxHeight: "300px",
  overflow: "hidden",
};

const saveContinueButtonStyle = {
  width: "100%",
  padding: "14px 0",
  background: "linear-gradient(90deg,#05014a 0%,#0021f3 100%)",
  color: "#fff",
  border: "2px solid #05014a",
  borderRadius: "13px",
  fontSize: "1rem",
  fontWeight: "600",
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
};

// Reusable Input
function LabeledInput({ label, type = "text", value, onChange }) {
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
