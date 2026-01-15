// src/pages/RawMaterialSummary.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import React from "react";
import { Package } from "lucide-react";

export default function RawMaterialSummary() {
  const { companyInfoId: paramCompanyInfoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Passed from previous page
  const { userId: passedUserId, companyInfoId: passedCompanyInfoId } =
    location.state || {};

  // ---------------- STATE ----------------
  const [userId, setUserId] = useState(passedUserId || null);
  const [companyInfoId, setCompanyInfoId] = useState(
    paramCompanyInfoId || passedCompanyInfoId || null
  );

  // Metadata fields
  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  // Table rows
  const [materials, setMaterials] = useState([
    { materialName: "", supplier: "", certNo: "", expiryDate: "" },
  ]);

  // ---------------- AUTH ----------------
  useEffect(() => {
    if (userId) return;
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    fetchUser();
  }, [userId, navigate]);

  // ---------------- FETCH EXISTING MULTI-ROW DATA ----------------
  useEffect(() => {
    const fetchSummary = async () => {
      if (!companyInfoId) return;

      const { data, error } = await supabase
        .from("raw_material_summary")
        .select("*")
        .eq("company_info_id", companyInfoId);

      if (error) return;

      if (data && data.length > 0) {
        // Metadata
        setImplementationDate(data[0].implementation_date || "");
        setReferenceNo(data[0].reference_no || "");
        setReviewNo(data[0].review_no || "");

        // Table rows
        const mapped = data.map((m) => ({
          materialName: m.material_name || "",
          supplier: m.supplier || "",
          certNo: m.cert_no || "",
          expiryDate: m.expiry_date || "",
        }));

        setMaterials(mapped);
      }
    };

    fetchSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [companyInfoId]);

  // ---------------- HANDLE ROW CHANGES ----------------
  const handleChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  const addRow = () =>
    setMaterials([
      ...materials,
      { materialName: "", supplier: "", certNo: "", expiryDate: "" },
    ]);

  const removeRow = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(
      updated.length
        ? updated
        : [{ materialName: "", supplier: "", certNo: "", expiryDate: "" }]
    );
  };

  // ---------------- BUILD DATA FOR NEXT PAGE ----------------
const materialSummaryData = {
  materials,
  metadata: { implementationDate, referenceNo, reviewNo, },
};

  // ---------------- SAVE (MULTI-ROW INSERT) ----------------
  const saveMaterials = async () => {
    if (!companyInfoId) return alert("❌ Missing Company Info ID.");

    const cleanMaterials = materials.filter(
      (m) =>
        m.materialName?.trim() ||
        m.supplier?.trim() ||
        m.certNo?.trim() ||
        m.expiryDate?.trim()
    );

    if (cleanMaterials.length === 0)
      return alert("Please enter at least one raw material.");

    // STEP 1: Delete old rows
    const { error: delErr } = await supabase
      .from("raw_material_summary")
      .delete()
      .eq("company_info_id", companyInfoId);

    if (delErr) {
      alert("❌ Failed to delete old data: " + delErr.message);
      return null;
    }

    // STEP 2: Insert new rows
    const payloadRows = cleanMaterials.map((m) => ({
      company_info_id: companyInfoId,
      material_name: m.materialName,
      supplier: m.supplier,
      cert_no: m.certNo,
      expiry_date: m.expiryDate || null,
      implementation_date: implementationDate || null,
      reference_no: referenceNo || null,
      review_no: reviewNo || null,
    }));

    const { data, error } = await supabase
      .from("raw_material_summary")
      .insert(payloadRows)
      .select();

    if (error) {
      alert("❌ Error saving raw material summary: " + error.message);
      return null;
    }

    alert("✅ Saved successfully!");
    return data;
  };

  // ---------------- BUTTONS ----------------
  const handleSaveBtn = async () => {
  const data = await saveMaterials();

  if (data) {
    navigate(`/ProductFlowChartRaw`, {
      state: { userId, companyInfoId, materialSummary: materialSummaryData,},
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

  const handleNextBtn = () => {
  navigate(`/ProductFlowChartRaw`, {
    state: { userId, companyInfoId, materialSummary: materialSummaryData, },
  });
};

  const handleBackBtn = () => {
    navigate(`/rawmaterialmaster`, {
      state: { userId, companyInfoId },
    });
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black flex-col">
      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
      />

      {/* NAV (updated: Home only) */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 sticky top-0 z-10">
        <a href="/" className="text-xs font-extrabold">Home</a>
        <div></div>
      </nav>

      {/* MAIN */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div
          className="relative"
          style={{
            width: "900px",
            maxWidth: "95vw",
            background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
            border: "4px solid #05014a",
            borderRadius: "48px",
            padding: "20px 22px 40px",
            boxShadow: "0 8px 40px #0021f344",
          }}
        >
          {/* PAGE TITLE */}
          <div
            style={{
              fontWeight: "600",
              fontSize: "1.15rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <Package size={20} /> Raw Material Summary
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
              📘 Topic 6: Raw Material Summary
            </h3>

            <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
              This section records your company’s raw material halal certification
              details and important document control information.
            </p>

            {/* METADATA INSIDE BOX */}
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

          {/* TABLE */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "#e6ecff" }}>
                <th style={thStyle}>Material Name</th>
                <th style={thStyle}>Supplier</th>
                <th style={thStyle}>Halal Cert No.</th>
                <th style={thStyle}>Expiry Date</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {materials.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={row.materialName}
                      onChange={(e) =>
                        handleChange(idx, "materialName", e.target.value)
                      }
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={row.supplier}
                      onChange={(e) =>
                        handleChange(idx, "supplier", e.target.value)
                      }
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={row.certNo}
                      onChange={(e) =>
                        handleChange(idx, "certNo", e.target.value)
                      }
                    />
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="date"
                      style={inputStyle}
                      value={row.expiryDate}
                      onChange={(e) =>
                        handleChange(idx, "expiryDate", e.target.value)
                      }
                    />
                  </td>

                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      style={removeButtonStyle}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addRow} style={addButtonStyle}>
            + Add Row
          </button>

          <button onClick={handleSaveBtn} style={saveButtonStyle}>
            💾 Save & Continue
          </button>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button onClick={handleBackBtn} style={backButtonStyle}>
              ⬅ Back
            </button>
            <button onClick={handleNextBtn} style={nextButtonStyle}>
              ➡ Next
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
      />
    </div>
  );
}

/* ---------------- STYLES ---------------- */
function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="font-semibold text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const thStyle = {
  padding: "10px",
  fontWeight: "600",
  border: "2px solid #05014a",
  textAlign: "center",
};

const tdStyle = {
  padding: "8px",
  border: "2px solid #05014a",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "8px",
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
  marginBottom: "10px",
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
};
