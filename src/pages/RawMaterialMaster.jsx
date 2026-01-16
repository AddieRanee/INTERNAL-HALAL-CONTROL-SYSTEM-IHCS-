// src/pages/RawMaterialMasterList.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import React from "react";
import { Package, ClipboardList, BookOpen } from "lucide-react";

export default function RawMaterialMasterList() {
  const { companyInfoId: paramCompanyInfoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userId: passedUserId, companyInfoId: passedCompanyInfoId } =
    location.state || {};

  const [userId, setUserId] = useState(passedUserId || null);
  const [companyInfoId, setCompanyInfoId] = useState(
    paramCompanyInfoId || passedCompanyInfoId || null
  );

  const [materials, setMaterials] = useState([]);
  const [sop, setSop] = useState({
    objective: "",
    scope: "",
    responsibilities: "",
    frequency: "",
    purchase: "",
    receipt: "",
    storage: "",
    record: "",
    implementation_date: "",
    reference_no: "",
    review_no: "",
  });

  // ---------------- AUTH ----------------
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/login");
      setUserId(user.id);
    };
    fetchUser();
  }, [userId, navigate]);

  // ---------------- FETCH EXISTING DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      if (!companyInfoId) return;

      // 1️⃣ Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from("raw_material_master")
        .select("*")
        .eq("company_info_id", companyInfoId);

      if (materialsError) {
        console.error("❌ Error fetching raw materials:", materialsError.message);
      } else if (materialsData?.length) {
        setMaterials(materialsData);
      } else {
        setMaterials([{
          raw_material_name: "",
          scientific_trade_name: "",
          source_of_raw_material: "",
          manufacturer_name_address: "",
          material_declaration_authorities: false,
          halal_cert_body: "CICOT",
          halal_cert_expiry: "",
        }]);
      }

      // 2️⃣ Fetch SOP
      const { data: sopData, error: sopError } = await supabase
        .from("raw_material_sop")
        .select("*")
        .eq("company_info_id", companyInfoId)
        .single();

      if (sopError && sopError.code !== "PGRST116") {
        console.error("❌ Error fetching SOP:", sopError.message);
      } else if (sopData) {
        setSop({
          objective: sopData.objective || "",
          scope: sopData.scope || "",
          responsibilities: sopData.responsibilities || "",
          frequency: sopData.frequency || "",
          purchase: sopData.purchase || "",
          receipt: sopData.receipt || "",
          storage: sopData.storage || "",
          record: sopData.record || "",
          implementation_date: sopData.implementation_date || "",
          reference_no: sopData.reference_no || "",
          review_no: sopData.review_no || "",
        });
      }
    };

    fetchData();
  }, [companyInfoId]);

  // ---------------- HANDLERS ----------------
  const handleChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSopChange = (field, value) => {
    setSop((prev) => ({ ...prev, [field]: value }));
  };

  const addRow = () => {
    setMaterials(prev => [
      ...prev,
      {
        raw_material_name: "",
        scientific_trade_name: "",
        source_of_raw_material: "",
        manufacturer_name_address: "",
        material_declaration_authorities: false,
        halal_cert_body: "CICOT",
        halal_cert_expiry: "",
      },
    ]);
  };

  const removeRow = async (index) => {
    const row = materials[index];
    if (row.id) {
      await supabase.from("raw_material_master").delete().eq("id", row.id);
    }
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated.length ? updated : [{
      raw_material_name: "",
      scientific_trade_name: "",
      source_of_raw_material: "",
      manufacturer_name_address: "",
      material_declaration_authorities: false,
      halal_cert_body: "CICOT",
      halal_cert_expiry: "",
    }]);
  };

 // ---------------- SAVE ALL ----------------
const saveAll = async () => {
  if (!companyInfoId) {
    alert("❌ Missing Company Info ID. Save company info first.");
    return;
  }

  try {
    // 1️⃣ Save materials
    for (const material of materials) {
      const record = {
        company_info_id: companyInfoId,
        raw_material_name: material.raw_material_name || "",
        scientific_trade_name: material.scientific_trade_name || "",
        source_of_raw_material: material.source_of_raw_material || "",
        manufacturer_name_address: material.manufacturer_name_address || "",
        material_declaration_authorities: material.material_declaration_authorities || false,
        halal_cert_body: material.halal_cert_body || "",
        halal_cert_expiry: material.halal_cert_expiry || null, // empty string converted to null
      };

      if (material.id) {
        const { error: updateError } = await supabase
          .from("raw_material_master")
          .update(record)
          .eq("id", material.id);
        if (updateError) console.error("❌ Material update error:", updateError);
      } else {
        const { error: insertError } = await supabase
          .from("raw_material_master")
          .insert([record]);
        if (insertError) console.error("❌ Material insert error:", insertError);
      }
    }

    // 2️⃣ Save SOP (upsert ensures insert or update)
    const sopPayload = {
      company_info_id: companyInfoId,
      objective: sop.objective || "",
      scope: sop.scope || "",
      responsibilities: sop.responsibilities || "",
      frequency: sop.frequency || "",
      purchase: sop.purchase || "",
      receipt: sop.receipt || "",
      storage: sop.storage || "",
      record: sop.record || "",
      implementation_date: sop.implementation_date || null, // convert empty string to null
      reference_no: sop.reference_no || "",
      review_no: sop.review_no || "",
      updated_at: new Date().toISOString(),
    };

    console.log("Saving SOP payload:", sopPayload); // debug log

    const { data: sopResult, error: sopError } = await supabase
      .from("raw_material_sop")
      .upsert(sopPayload, {
        onConflict: "company_info_id",
        returning: "representation",
      });

    if (sopError) {
      console.error("❌ SOP save error:", sopError);
      alert("❌ Error saving SOP. Check console for details.");
    } else {
      console.log("✅ SOP saved:", sopResult);
      alert("✅ Raw materials & SOP saved successfully!");
    }

  } catch (err) {
    console.error("❌ Unexpected error saving data:", err);
    alert("❌ Unexpected error. Check console for details.");
  }
};

  // ---------------- BUILD DATA FOR NEXT PAGE ----------------
  const buildRawMaterialData = () => ({
    materials,
    sop: { ...sop },
  });

  // ---------------- NAVIGATION ----------------
  const handleSaveBtn = async () => {
    await saveAll();
    const rawMaterialData = buildRawMaterialData();
    navigate("/rawmaterialsummary", { state: { userId, companyInfoId, rawMaterialData } });
  };

  const handleNextBtn = () => {
    const rawMaterialData = buildRawMaterialData();
    navigate("/rawmaterialsummary", { state: { userId, companyInfoId, rawMaterialData } });
  };

  const handleBackBtn = () => {
    navigate("/productlist", { state: { userId, companyInfoId } });
  };

  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black flex-col">

      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
      />

      {/* NAVBAR — moved under the header */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 z-10">
        <a href="/dashboard" className="text-xs font-extrabold">
          Home
        </a>
        <div></div>
      </nav>

      <main className="flex flex-col items-center flex-1 p-6 gap-8">
        <div
          style={{
            width: "98%",
            maxWidth: "1600px",
            background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
            padding: "20px 22px",
            borderRadius: "32px",
            border: "4px solid #05014a",
            boxShadow: "0 8px 40px #0021f344",
          }}
        >
          <div className="flex items-center gap-2 text-xl font-semibold text-black mb-3">
            <Package size={24} />
            Raw Material Master List
          </div>

          <div
            style={{
              background: "#eef2ff",
              border: "2px solid #05014a",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
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
              📘 Topic 5: Raw Material Master List
            </h3>

            <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
              This section records your company’s raw materials and important
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
              {["implementation_date", "reference_no", "review_no"].map((f) => (
                <div key={f}>
                  <label className="font-semibold capitalize">
                    {f.replace(/_/g, " ")}:
                  </label>
                  <input
                    type={f.includes("date") ? "date" : "text"}
                    style={inputStyle}
                    value={sop[f] || ""}
                    onChange={(e) => handleSopChange(f, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div
          className="relative"
          style={{
            width: "98%",
            maxWidth: "1600px",
            background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
            border: "4px solid #05014a",
            borderRadius: "32px",
            boxShadow: "0 8px 40px #0021f344",
            padding: "20px 22px",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                minWidth: "1300px",
              }}
            >
              <thead>
                <tr style={{ background: "#e6ecff" }}>
                  <th style={thStyle}>Material Name</th>
                  <th style={thStyle}>Scientific / Brand Name</th>
                  <th style={thStyle}>Raw Material Source</th>
                  <th style={thStyle}>Manufacturer</th>
                  <th style={thStyle}>Material Declaration</th>
                  <th style={thStyle}>Halal Cert Body</th>
                  <th style={thStyle}>Expiry Date</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {materials.map((row, idx) => (
                  <tr key={idx}>
                    {[
                      "raw_material_name",
                      "scientific_trade_name",
                      "source_of_raw_material",
                      "manufacturer_name_address",
                    ].map((f) => (
                      <td key={f} style={tdStyle}>
                        <textarea
                          style={textareaStyle}
                          value={row[f] || ""}
                          onChange={(e) => handleChange(idx, f, e.target.value)}
                        />
                      </td>
                    ))}

                    <td style={tdStyle}>
                      <select
                        style={inputStyle}
                        value={
                          row.material_declaration_authorities ? "true" : "false"
                        }
                        onChange={(e) =>
                          handleChange(
                            idx,
                            "material_declaration_authorities",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </td>

                    <td style={tdStyle}>
                      <textarea
                        style={textareaStyle}
                        value={row.halal_cert_body || ""}
                        onChange={(e) =>
                          handleChange(idx, "halal_cert_body", e.target.value)
                        }
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        type="date"
                        style={inputStyle}
                        value={row.halal_cert_expiry || ""}
                        onChange={(e) =>
                          handleChange(idx, "halal_cert_expiry", e.target.value)
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
          </div>

          <button type="button" onClick={addRow} style={addButtonStyle}>
            + Add Row
          </button>
        </div>

        {/* SOP SECTION */}
        <div
          className="relative"
          style={{
            width: "98%",
            maxWidth: "1400px",
            background: "linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)",
            border: "4px solid #05014a",
            borderRadius: "32px",
            boxShadow: "0 8px 40px #0021f344",
            padding: "20px 22px 40px 22px",
          }}
        >
          <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-black">
            <ClipboardList size={24} /> Standard Operating Procedures (SOP)
          </div>

          {[
            "objective",
            "scope",
            "responsibilities",
            "frequency",
            "purchase",
            "receipt",
            "storage",
            "record",
          ].map((field) => (
            <div key={field} className="mb-3">
              <label className="font-semibold capitalize">{field}:</label>
              <textarea
                style={textareaStyle}
                rows={2}
                value={sop[field] || ""}
                onChange={(e) => handleSopChange(field, e.target.value)}
              />
            </div>
          ))}

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              style={saveButtonStyle}
              onClick={handleSaveBtn}
            >
              💾 Save & Continue
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                style={backButtonStyle}
                onClick={handleBackBtn}
              >
                ⬅ Back
              </button>
              <button
                type="button"
                style={nextButtonStyle}
                onClick={handleNextBtn}
              >
                ➡ Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
      />
    </div>
  );
}

// ---------------- STYLES ----------------
const thStyle = {
  padding: "10px",
  fontWeight: "600",
  border: "2px solid #05014a",
  textAlign: "center",
};
const tdStyle = { padding: "8px", border: "2px solid #05014a" };
const inputStyle = {
  width: "100%",
  padding: "6px",
  borderRadius: "6px",
  border: "2px solid #05014a",
};
const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: "60px" };
const removeButtonStyle = {
  background: "#ff4d4d",
  border: "none",
  color: "white",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};
const addButtonStyle = {
  marginBottom: "10px",
  padding: "8px 12px",
  background: "#0021f3",
  color: "white",
  borderRadius: "13px",
  border: "none",
  cursor: "pointer",
};
const saveButtonStyle = {
  width: "100%",
  padding: "16px 0",
  background: "linear-gradient(90deg,#05014a 0%,#0021f3 100%)",
  color: "#fff",
  borderRadius: "13px",
  border: "2px solid #05014a",
  cursor: "pointer",
};
const backButtonStyle = {
  flex: 1,
  padding: "16px 0",
  background: "linear-gradient(90deg,#6b7280 0%,#9ca3af 100%)",
  color: "#fff",
  borderRadius: "13px",
  border: "2px solid #374151",
  cursor: "pointer",
};
const nextButtonStyle = {
  flex: 1,
  padding: "16px 0",
  background: "linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)",
  color: "#fff",
  borderRadius: "13px",
  border: "2px solid #05014a",
  cursor: "pointer",
};
