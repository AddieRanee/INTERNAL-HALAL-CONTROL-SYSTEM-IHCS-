import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { Info, PlusCircle, ClipboardCheck } from "lucide-react";

export default function AboutDashboard({ onLogout }) {
  const navigate = useNavigate();

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  /* 📸 Logo preview */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (!file) return setLogoPreview("");
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ☁ Upload logo */
  const uploadLogo = async (file) => {
    const ext = file.name.split(".").pop();
    const path = `logo/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("about-assets")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("about-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  /* 💾 Save About */
  const handleSave = async () => {
    try {
      setLoading(true);
      let logoUrl = null;

      if (logo) logoUrl = await uploadLogo(logo);

      const { error } = await supabase.from("about_kazai").insert([
        {
          logo_url: logoUrl,
          about_title: title,
          about_description: description,
        },
      ]);

      if (error) throw error;

      alert("✅ About Kazai saved successfully!");
      setLogo(null);
      setLogoPreview("");
      setTitle("");
      setDescription("");
    } catch (err) {
      alert("❌ Failed to save About page");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f8ff] font-poppins text-black">

      {/* HEADER */}
      <img
        src={IhcsHeader}
        alt="IHCS Header"
        className="w-full h-auto object-cover shadow-lg"
      />

      {/* ✅ SAME STAFF NAVBAR */}
      <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700 z-10">
        <Link
          to="/staff-landing-dashboard"
          className="text-xl font-extrabold hover:text-blue-600 transition"
        >
          Staff Home
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link
            to="/about-dashboard"
            className="text-blue-600 font-bold"
          >
            About
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <Link
            to="/staff-status-update"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <ClipboardCheck size={18} />
            Status Update
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <Link
            to="/staff-add-info"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <PlusCircle size={18} />
            Add Info
          </Link>

          <span className="text-blue-600 font-extrabold">/</span>

          <button
            onClick={() => onLogout && onLogout(navigate)}
            className="text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* FORM */}
      <main className="flex items-center justify-center flex-1 p-6">
        <div style={cardStyle}>
          <div style={titleStyle}>
            <Info size={22} />
            About Kazai Information
          </div>

          <div style={{ padding: "0 36px", marginTop: "12px" }}>
            <div style={noteStyle}>
              Enter official organization details for IHCS documentation and
              public display.
            </div>
          </div>

          <form style={formStyle}>
            <label style={labelStyle}>
              Organization Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} />
              {logoPreview && (
                <img src={logoPreview} alt="Preview" style={logoStyle} />
              )}
            </label>

            <FormInput
              label="About Title"
              value={title}
              onChange={setTitle}
              required
            />

            <TextArea
              label="About Description"
              value={description}
              onChange={setDescription}
              rows={6}
            />

            <button
              type="button"
              style={saveButtonStyle}
              onClick={handleSave}
              disabled={loading || !title.trim()}
            >
              {loading ? "Saving…" : "💾 Save About"}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <img
        src={IhcsFooter}
        alt="IHCS Footer"
        className="w-full h-auto object-cover shadow-lg mt-auto"
      />
    </div>
  );
}

/* 🧩 Components */
function FormInput({ label, value, onChange, required }) {
  return (
    <label style={labelStyle}>
      {label} {required && <span style={{ color: "red" }}>*</span>}
      <input
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows }) {
  return (
    <label style={labelStyle}>
      {label}
      <textarea
        style={inputStyle}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* 🎨 Styles (unchanged) */
const cardStyle = {
  width: "700px",
  maxWidth: "95vw",
  background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
  border: "4px solid #05014a",
  borderRadius: "48px",
  boxShadow: "0 8px 40px #0021f344",
  paddingBottom: "24px",
};

const titleStyle = {
  padding: "20px 36px 0",
  fontWeight: 600,
  fontSize: "1.15rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const noteStyle = {
  background: "linear-gradient(135deg,#dbe7ff,#bcd4ff)",
  border: "2px solid #0021f3",
  borderRadius: "18px",
  padding: "14px",
  fontWeight: 600,
};

const formStyle = {
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const labelStyle = {
  fontWeight: 600,
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "8px",
  borderRadius: "13px",
  border: "2px solid #05014a",
};

const logoStyle = {
  marginTop: "10px",
  height: "80px",
  objectFit: "contain",
};

const saveButtonStyle = {
  marginTop: "20px",
  padding: "16px 0",
  background: "linear-gradient(90deg,#05014a,#0021f3)",
  color: "#fff",
  borderRadius: "13px",
  fontWeight: 600,
};
