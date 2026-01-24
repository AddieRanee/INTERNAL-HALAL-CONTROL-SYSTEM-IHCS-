// src/pages/Traceability.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import IHCSReport from "../components/IHCSReport.jsx";

import TraceabilityTemplate from "../assets/Traceability_Templete 2.png";
import TraceabilityReference from "../assets/Traceability_Reference L2 (A4).png";

export default function Traceability({ companyInfoId, companyId }) {
  const location = useLocation();
  const stateCompanyId =
    location.state?.companyInfoId || location.state?.companyId || null;
  const resolvedCompanyId =
    companyInfoId ?? companyId ?? stateCompanyId ?? null;

  const [file1, setFile1] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [preview2, setPreview2] = useState(null);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [allData, setAllData] = useState({});

  // HEADER INPUTS
  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  useEffect(() => {
    if (!resolvedCompanyId) return;
    try {
      const saved = localStorage.getItem(`traceability_${resolvedCompanyId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setImplementationDate(data.implementationDate || "");
        setReferenceNo(data.referenceNo || "");
        setReviewNo(data.reviewNo || "");
        setPreview1(data.preview1 || null);
        setPreview2(data.preview2 || null);
      }
    } catch (err) {
      console.warn("Failed to read traceability localStorage:", err);
    }
  }, [resolvedCompanyId]);

  useEffect(() => {
    if (!resolvedCompanyId) return;
    try {
      localStorage.setItem(
        `traceability_${resolvedCompanyId}`,
        JSON.stringify({
          implementationDate,
          referenceNo,
          reviewNo,
          preview1,
          preview2,
        })
      );
    } catch (err) {
      console.warn("Failed to write traceability localStorage:", err);
    }
  }, [implementationDate, referenceNo, reviewNo, preview1, preview2, resolvedCompanyId]);

  const handleFileChange = (e, setFile, setPreview) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!["image/png", "image/jpeg", "application/pdf"].includes(selected.type)) {
      alert("❌ Only PNG, JPG or PDF allowed.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!resolvedCompanyId || resolvedCompanyId.length < 3) {
      alert(
        "⚠️ Missing or invalid company ID — please re-open this page through the company section."
      );
      return;
    }

    if (!file1 && !file2 && !preview1 && !preview2) {
      alert("Please upload at least one Traceability file before saving.");
      return;
    }

    try {
      setLoading(true);

      const uploadFile = async (file, index) => {
        if (!file) return null;
        const ext = file.name.split(".").pop();
        const fileName = `${resolvedCompanyId}_${Date.now()}_${index + 1}.${ext}`;
        const filePath = `traceability/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("ihcs-files")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("ihcs-files")
          .getPublicUrl(filePath);

        return publicData.publicUrl;
      };

      const url1 = file1 ? await uploadFile(file1, 0) : preview1 || null;
      const url2 = file2 ? await uploadFile(file2, 1) : preview2 || null;

      const { data: existing } = await supabase
        .from("traceability")
        .select("id")
        .eq("company_info_id", resolvedCompanyId);

      const payload = {
        file1_url: url1,
        file2_url: url2,
        implementation_date: implementationDate || null,
        reference_no: referenceNo || null,
        review_no: reviewNo || null,
        updated_at: new Date(),
      };

      if (existing?.length) {
        await supabase
          .from("traceability")
          .update(payload)
          .eq("company_info_id", resolvedCompanyId);
      } else {
        await supabase
          .from("traceability")
          .insert([{ company_info_id: resolvedCompanyId, ...payload }]);
      }

      setPreview1(url1);
      setPreview2(url2);
      setFile1(null);
      setFile2(null);

      alert("✅ Traceability files & inputs saved successfully!");
    } catch (err) {
      console.error("Error saving traceability:", err);
      alert("❌ Error saving traceability: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTables = async () => {
    const tables = [
      "company_info",
      "company_background",
      "organisation_chart",
      "halal_policy",
      "product_list",
      "raw_material_master",
      "raw_material_sop",
      "raw_material_summary",
      "product_flow_chart_raw",
      "product_flow_process",
      "premise_plan",
      "traceability",
      "profiles",
    ];

    const result = {};
    for (let t of tables) {
      try {
        const column = t === "company_info" ? "id" : "company_info_id";
        const { data, error } = await supabase
          .from(t)
          .select("*")
          .eq(column, resolvedCompanyId);

        if (error) throw error;
        result[t] = data || [];
      } catch (err) {
        console.error(`❌ Error fetching ${t}:`, err);
        result[t] = [];
      }
    }
    setAllData(result);
    return result;
  };

const handleGeneratePdf = async () => {
  if (!resolvedCompanyId) {
    alert("⚠️ Missing company ID — cannot generate report.");
    return;
  }

  try {
    setGenerating(true);

    const freshData = await fetchAllTables();

    if (!freshData || Object.keys(freshData).length === 0) {
      throw new Error("No data fetched for this company.");
    }

    const docElement = (
      <IHCSReport
        allData={freshData}
        meta={{
          generatedBy: "IHCS System",
          generatedAt: new Date().toLocaleString(),
        }}
      />
    );

    const blob = await pdf(docElement).toBlob();
    const url = URL.createObjectURL(blob);

    // 1️⃣ Preview in new tab
    window.open(url, "_blank");

    // 2️⃣ Force download immediately
    const a = document.createElement("a");
    a.href = url;
    a.download = `IHCS_Report_${resolvedCompanyId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("❌ Error generating PDF: " + (err.message || err));
  } finally {
    setGenerating(false);
  }
};
  const PreviewBox = ({ file, preview, title }) => (
    <div style={previewBoxStyle}>
      {file?.type === "application/pdf" ? (
        <iframe
          src={preview}
          title={title}
          style={{ width: "100%", height: "300px", border: "none" }}
        />
      ) : (
        <img src={preview} alt={title} style={{ maxWidth: "100%", borderRadius: 12 }} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex font-poppins text-black">
      <div className="flex-1 flex flex-col" style={{ background: "#f4f8ff" }}>
        <img
          src={IhcsHeader}
          alt="IHCS Header"
          className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
        />

        {/* UPDATED NAV — only Home left */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700">
          <Link
            to="/"
            className="text-xs font-extrabold text-black hover:text-blue-600"
          >
            Home
          </Link>
          <div></div>
        </nav>

        <main className="flex items-center justify-center flex-1 p-6">
          <div style={mainBoxStyle}>
            {/* TITLE */}
            <div style={titleStyle}>
              <FileText size={22} color="#05014a" /> Traceability Documents
            </div>

            {/* TOPIC HEADER */}
            <div style={topicBoxStyle}>
              <h3 style={topicTitleStyle}>📘 Topic 10: Traceability Documents</h3>
              <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                Upload your company’s traceability template & reference documents, and fill the header information.
              </p>

              <label style={labelStyle}>
                Implementation Date
                <input
                  type="date"
                  value={implementationDate}
                  onChange={(e) => setImplementationDate(e.target.value)}
                  style={inputInput}
                />
              </label>

              <label style={labelStyle}>
                Reference No / Doc No
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Enter Reference No / Doc No"
                  style={inputInput}
                />
              </label>

              <label style={labelStyle}>
                Review No
                <input
                  type="text"
                  value={reviewNo}
                  onChange={(e) => setReviewNo(e.target.value)}
                  placeholder="Enter Review No"
                  style={inputInput}
                />
              </label>
            </div>

            {/* EXAMPLE PREVIEW */}
            <div style={exampleBoxStyle}>
              <h3 style={topicTitleStyle}>📑 Example Reference Documents</h3>
              <div style={exampleFlexStyle}>
                <div style={exampleItemStyle}>
                  <img src={TraceabilityTemplate} alt="Traceability Template" style={exampleImgStyle} />
                  <p style={exampleCaptionStyle}>Template Example</p>
                </div>
                <div style={exampleItemStyle}>
                  <img src={TraceabilityReference} alt="Traceability Reference" style={exampleImgStyle} />
                  <p style={exampleCaptionStyle}>Reference L2 Example</p>
                </div>
              </div>
            </div>

            {/* FILE UPLOADS */}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,application/pdf"
              onChange={(e) => handleFileChange(e, setFile1, setPreview1)}
              style={inputInput}
            />
            {preview1 && <PreviewBox file={file1} preview={preview1} title="Preview 1" />}

            <input
              type="file"
              accept=".png,.jpg,.jpeg,application/pdf"
              onChange={(e) => handleFileChange(e, setFile2, setPreview2)}
              style={inputInput}
            />
            {preview2 && <PreviewBox file={file2} preview={preview2} title="Preview 2" />}

            <button
              type="button"
              style={saveButtonStyle}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Save Both & Continue"}
            </button>

            <div style={{ marginTop: 20, width: "100%", textAlign: "center" }}>
              <button
                onClick={handleGeneratePdf}
                disabled={generating}
                style={generateButtonStyle}
              >
                {generating ? "Generating PDF..." : "📄 Generate Full IHCS Report (Preview)"}
              </button>
            </div>
          </div>
        </main>

        <img
          src={IhcsFooter}
          alt="IHCS Footer"
          className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
        />
      </div>
    </div>
  );
}

/* ---- STYLES ---- */
const mainBoxStyle = {
  width: "800px",
  maxWidth: "95vw",
  background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
  border: "4px solid #05014a",
  borderRadius: 48,
  boxShadow: "0 8px 40px #0021f344",
  padding: "20px 22px 40px 22px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 150,
};

const titleStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  fontSize: "1.15rem",
  marginBottom: 16,
};

const topicBoxStyle = {
  width: "100%",
  background: "#eef2ff",
  border: "2px solid #05014a",
  borderRadius: 18,
  padding: 16,
  marginBottom: 20,
};

const topicTitleStyle = {
  fontWeight: 700,
  fontSize: "1rem",
  marginBottom: 6,
  color: "#05014a",
};

const labelStyle = {
  fontWeight: 600,
  display: "flex",
  flexDirection: "column",
  color: "black",
  gap: 4,
  marginBottom: 10,
};

const inputInput = {
  width: "100%",
  padding: 10,
  borderRadius: 13,
  border: "2px solid #05014a",
  fontSize: "1rem",
  outlineColor: "#2563eb",
  marginTop: 4,
};

const exampleBoxStyle = {
  width: "100%",
  marginBottom: 20,
  padding: 10,
  border: "2px dashed #2563eb",
  borderRadius: 12,
  background: "#f0f7ff",
};

const exampleFlexStyle = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
  justifyContent: "center",
};

const exampleItemStyle = {
  flex: "1 1 300px",
  textAlign: "center",
};

const exampleImgStyle = {
  maxWidth: "100%",
  borderRadius: 8,
  border: "2px solid #05014a",
};

const exampleCaptionStyle = {
  marginTop: 6,
  fontSize: "0.85rem",
};

const previewBoxStyle = {
  width: "100%",
  marginBottom: 20,
  border: "2px solid #05014a",
  borderRadius: 16,
  padding: 8,
  maxHeight: 300,
  overflow: "hidden",
};

const saveButtonStyle = {
  width: "100%",
  padding: "16px 0",
  background: "linear-gradient(90deg,#05014a 0%,#0021f3 100%)",
  color: "#fff",
  border: "2px solid #05014a",
  borderRadius: 13,
  fontSize: "1.15rem",
  fontWeight: 600,
  marginTop: 10,
  boxShadow: "0 2px 14px #0021f355",
  cursor: "pointer",
};

const generateButtonStyle = {
  padding: "12px 18px",
  backgroundColor: "#198754",
  color: "#fff",
  borderRadius: 10,
  fontWeight: 700,
  marginTop: 8,
  border: "none",
};
