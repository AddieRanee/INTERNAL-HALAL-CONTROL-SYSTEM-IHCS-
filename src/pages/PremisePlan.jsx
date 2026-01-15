// src/pages/PremisePlan.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Map } from "lucide-react";
import supabase from "../supabaseClient";
import BackgroundWeb from "../assets/BackgroundWeb.png";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";

export default function PremisePlan() {
  const navigate = useNavigate();
  const location = useLocation();

  const companyInfoId =
    location.state?.companyInfoId || localStorage.getItem("companyInfoId");

  const [layoutImageUrl, setLayoutImageUrl] = useState(null);
  const [layoutImageFile, setLayoutImageFile] = useState(null);
  const [description, setDescription] = useState("");

  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      if (!companyInfoId) return;

      const { data, error } = await supabase
        .from("premise_plan")
        .select("*")
        .eq("company_info_id", companyInfoId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
        return;
      }

      if (data) {
        setDescription(data.description ?? "");
        setLayoutImageUrl(data.layout_image_url ?? "");
        setImplementationDate(data.implementation_date || "");
        setReferenceNo(data.reference_no || "");
        setReviewNo(data.review_no || "");
      }
    }

    loadExisting();
  }, [companyInfoId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLayoutImageFile(file);
    setLayoutImageUrl(URL.createObjectURL(file));
  };

  const premisePlanData = {
  description,
  layoutImageUrl,
  implementationDate,
  referenceNo,
  reviewNo,
};

  const saveData = async () => {
    if (!companyInfoId || companyInfoId.length < 5) {
      alert("⚠️ Missing or invalid company ID.");
      return false;
    }

    if (!layoutImageFile && !layoutImageUrl) {
      alert("Please select a layout image before saving.");
      return false;
    }

    try {
      setLoading(true);
      let publicUrl = layoutImageUrl;

      if (layoutImageFile) {
        const ext = layoutImageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `premise_plan/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("ihcs-files")
          .upload(filePath, layoutImageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("ihcs-files")
          .getPublicUrl(filePath);

        publicUrl = publicData.publicUrl;
      }

      const { data: existingRows } = await supabase
        .from("premise_plan")
        .select("id")
        .eq("company_info_id", companyInfoId);

      const payload = {
        description,
        layout_image_url: publicUrl,
        implementation_date: implementationDate,
        reference_no: referenceNo,
        review_no: reviewNo,
        updated_at: new Date(),
      };

      if (existingRows && existingRows.length > 0) {
        await supabase
          .from("premise_plan")
          .update(payload)
          .eq("company_info_id", companyInfoId);
      } else {
        await supabase.from("premise_plan").insert([
          {
            company_info_id: companyInfoId,
            ...payload,
          },
        ]);
      }

      alert("✅ Premise Plan saved successfully!");
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
  const ok = await saveData();

  if (ok) {
    navigate("/traceability", {
      state: {
        companyInfoId,
        premisePlanData,
      },
    });
  }
};

const handleNext = () => {
  navigate("/traceability", {
    state: {
      companyInfoId,
      premisePlanData,
    },
  });
};

  const handleBack = () => {
    navigate("/productflowprocess", { state: { companyInfoId } });
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
          className="w-full h-auto object-cover rounded-b-3xl"
        />

        {/* Navbar (cleaned) */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <Link to="/" className="text-xs font-extrabold text-black">
            Home
          </Link>
          <div></div>
        </nav>

        {/* Main content */}
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
              gap: "16px",
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
              <Map size={22} color="#05014a" /> Premise Plan
            </div>

            {/* 🔵 TOPIC HEADER BOX */}
            <div
              style={{
                background: "#eef2ff",
                border: "2px solid #05014a",
                borderRadius: "18px",
                padding: "16px",
                marginBottom: "16px",
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
                📘 Topic 9: Premise Plan
              </h3>
              <p style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                This section records your company’s premise layout and important document control details.
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
                Reference No.
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  style={inputInput}
                />
              </label>

              <label style={labelStyle}>
                Review No.
                <input
                  type="text"
                  value={reviewNo}
                  onChange={(e) => setReviewNo(e.target.value)}
                  style={inputInput}
                />
              </label>
            </div>

            {/* IMAGE UPLOAD */}
            <label style={labelStyle}>
              Layout Image Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: "8px" }}
              />
            </label>

            {layoutImageUrl && (
              <div style={previewBoxStyle}>
                <img
                  src={layoutImageUrl}
                  alt="Premise Layout"
                  style={{
                    width: "100%",
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
