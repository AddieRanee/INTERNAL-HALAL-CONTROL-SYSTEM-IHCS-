// src/pages/ProductFlowChartRaw.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Workflow } from "lucide-react";
import supabase from "../supabaseClient";
import BackgroundWeb from "../assets/BackgroundWeb.png";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";

export default function ProductFlowChartRaw() {
  const navigate = useNavigate();
  const location = useLocation();

  const companyInfoId =
    location.state?.companyInfoId || localStorage.getItem("companyInfoId");

  const [flowchartImageUrl, setFlowchartImageUrl] = useState(null);
  const [flowchartImageFile, setFlowchartImageFile] = useState(null);
  const [description, setDescription] = useState("");

  // HEADER FIELDS
  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  const [loading, setLoading] = useState(false);

  // LOAD EXISTING
  useEffect(() => {
    async function loadExisting() {
      if (!companyInfoId) return;

      try {
        const { data, error } = await supabase
          .from("product_flow_chart_raw")
          .select(
            "description, flowchart_image_url, implementation_date, reference_no, review_no"
          )
          .eq("company_info_id", companyInfoId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setDescription(data.description ?? "");
          setFlowchartImageUrl(data.flowchart_image_url ?? "");

          setImplementationDate(data.implementation_date ?? "");
          setReferenceNo(data.reference_no ?? "");
          setReviewNo(data.review_no ?? "");
        }
      } catch (err) {
        console.error("Error loading existing:", err);
      }
    }

    loadExisting();
  }, [companyInfoId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFlowchartImageFile(file);
    setFlowchartImageUrl(URL.createObjectURL(file));
  };

  // SAVE
  const saveData = async () => {
    if (!companyInfoId) {
      alert("⚠️ Missing company info ID.");
      return false;
    }

    if (!flowchartImageFile && !flowchartImageUrl) {
      alert("Please upload a flowchart image.");
      return false;
    }

    try {
      setLoading(true);
      let publicUrl = flowchartImageUrl;

      if (flowchartImageFile) {
        const ext = flowchartImageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `product_flow_chart_raw/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("ihcs-files")
          .upload(filePath, flowchartImageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("ihcs-files")
          .getPublicUrl(filePath);

        publicUrl = urlData.publicUrl;
      }

      const { data: existing } = await supabase
        .from("product_flow_chart_raw")
        .select("id")
        .eq("company_info_id", companyInfoId);

      const payload = {
        description,
        flowchart_image_url: publicUrl,
        implementation_date: implementationDate,
        reference_no: referenceNo,
        review_no: reviewNo,
        updated_at: new Date(),
      };

      if (existing && existing.length > 0) {
        await supabase
          .from("product_flow_chart_raw")
          .update(payload)
          .eq("company_info_id", companyInfoId);
      } else {
        await supabase.from("product_flow_chart_raw").insert([
          {
            company_info_id: companyInfoId,
            ...payload,
          },
        ]);
      }

      alert("✅ Product Flow Chart (Raw) saved!");
      return true;
    } catch (err) {
      console.error(err);
      alert("❌ Error saving: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const productFlowChartRawData = {
  description,
  flowchartImageUrl,
  implementationDate,
  referenceNo,
  reviewNo,
};

const handleSaveContinue = async () => {
  const ok = await saveData();

  if (ok) {
    navigate("/productflowprocess", {
      state: {
        companyInfoId,
        productFlowChartRawData,
      },
    });
  }
};

const handleNext = () => {
  navigate("/productflowprocess", {
    state: {
      companyInfoId,
      productFlowChartRawData,
    },
  });
};

  const handleBack = () => {
    navigate("/rawmaterialsummary", { state: { companyInfoId } });
  };

  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: `url(${BackgroundWeb})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src={IhcsHeader}
          alt="IHCS Header"
          className="w-full h-auto object-cover shadow-lg rounded-b-3xl"
        />

        {/* NAVIGATION – Home Only */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <div className="flex justify-start">
            <Link
              to="/"
              className="text-xs font-extrabold text-black tracking-wide no-underline hover:text-blue-600 transition-colors duration-300"
            >
              Home
            </Link>
          </div>

          <div></div>
        </nav>

        {/* MAIN FORM */}
        <main className="flex items-center justify-center flex-1 p-6">
          <div
            style={{
              width: "700px",
              maxWidth: "95vw",
              background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
              border: "4px solid #05014a",
              borderRadius: "48px",
              boxShadow: "0 8px 40px #0021f344",
              padding: "20px 22px 40px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              marginBottom: "200px",
            }}
          >
            {/* TITLE */}
            <div
              style={{
                paddingBottom: "12px",
                fontWeight: "600",
                fontSize: "1.15rem",
                color: "black",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Workflow size={22} color="#05014a" /> Product Flow Chart (Raw)
            </div>

            {/* TOPIC HEADER */}
            <div
              style={{
                background: "#eef2ff",
                border: "2px solid #05014a",
                borderRadius: "18px",
                padding: "16px",
              }}
            >
              <h3
                style={{
                  fontWeight: "700",
                  fontSize: "1rem",
                  marginBottom: "6px",
                  color: "#05014a",
                }}
              >
                📘 Topic 7: Product Flow Chart (Raw)
              </h3>

              <p style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                This section records your company’s raw product flow chart and
                important document control details.
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
                Reference Number
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  style={inputInput}
                  placeholder="Enter reference number"
                />
              </label>

              <label style={labelStyle}>
                Review Number
                <input
                  type="text"
                  value={reviewNo}
                  onChange={(e) => setReviewNo(e.target.value)}
                  style={inputInput}
                  placeholder="Enter review number"
                />
              </label>
            </div>

            {/* IMAGE UPLOAD */}
            <label style={labelStyle}>
              Upload Flowchart Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: "8px" }}
              />
            </label>

            {flowchartImageUrl && (
              <div style={previewBoxStyle}>
                <img
                  src={flowchartImageUrl}
                  alt="Flowchart Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                  }}
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
                placeholder="Enter description"
              />
            </label>

            {/* BUTTONS */}
            <button
              type="button"
              style={saveButtonStyle}
              onClick={handleSaveContinue}
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Save & Continue"}
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" style={backButtonStyle} onClick={handleBack}>
                ⬅ Back
              </button>
              <button type="button" style={nextButtonStyle} onClick={handleNext}>
                ➡ Next
              </button>
            </div>
          </div>
        </main>

        <img
          src={IhcsFooter}
          alt="IHCS Footer"
          className="w-full h-auto object-cover rounded-t-3xl"
        />
      </div>

      <style>{`
        .nav-link-fancy {
          position: relative;
          color: black;
          text-decoration: none;
          transition: color 0.2s, text-shadow 0.2s;
          padding: 0 12px;
          font-weight: 600;
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

/* ---- STYLES ---- */

const labelStyle = {
  fontWeight: "600",
  display: "flex",
  flexDirection: "column",
  color: "black",
  gap: "4px",
  marginBottom: "10px",
};

const inputInput = {
  width: "100%",
  padding: "10px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  outlineColor: "#2563eb",
};

const textareaStyle = {
  width: "100%",
  marginTop: "4px",
  padding: "10px",
  borderRadius: "13px",
  border: "2px solid #05014a",
  fontSize: "1rem",
  color: "black",
  outlineColor: "#2563eb",
  resize: "vertical",
  minHeight: "120px",
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
  boxShadow: "0 2px 14px #0021f355",
  cursor: "pointer",
};

const previewBoxStyle = {
  marginTop: "12px",
  border: "2px solid #05014a",
  borderRadius: "16px",
  padding: "8px",
  maxHeight: "300px",
  overflow: "hidden",
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
