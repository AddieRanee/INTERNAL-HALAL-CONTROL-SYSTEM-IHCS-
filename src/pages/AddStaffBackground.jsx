import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { User, PlusCircle, ClipboardCheck } from "lucide-react";

export default function AddStaffBackground({ onLogout }) {
  const navigate = useNavigate();

  const [staffId, setStaffId] = useState(null);
  const [staffPhoto, setStaffPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [staffName, setStaffName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [position, setPosition] = useState("");
  const [backgroundSummary, setBackgroundSummary] = useState("");

  const [highlights, setHighlights] = useState([""]);
  const [yearsOfExperience, setYearsOfExperience] = useState([""]);

  const [loading, setLoading] = useState(false);

  /* 🔄 AUTO LOAD WHEN NAME IS TYPED */
  useEffect(() => {
    if (!staffName.trim()) return;

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("staff_background")
        .select("*")
        .eq("staff_name", staffName.trim())
        .single();

      if (data) {
        setStaffId(data.id);
        setContactInfo(data.contact_info || "");
        setPosition(data.position || "");
        setBackgroundSummary(data.background_summary || "");
        setHighlights(data.highlights ? data.highlights.split("\n") : [""]);
        setYearsOfExperience(
          data.years_of_experience
            ? data.years_of_experience.split("\n")
            : [""]
        );
        setPhotoPreview(data.staff_photo_url || "");
        setStaffPhoto(null);
      } else {
        setStaffId(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [staffName]);

  /* 📸 Image preview */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setStaffPhoto(file);

    if (!file) return setPhotoPreview("");

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ☁ Upload image */
  const uploadStaffImage = async (file) => {
    const ext = file.name.split(".").pop();
    const filePath = `staff/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("Staff")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from("Staff").getPublicUrl(filePath);
    return data.publicUrl;
  };

  /* 💾 SAVE (INSERT OR UPDATE) */
  const handleSave = async () => {
    try {
      setLoading(true);

      let photoUrl = photoPreview;
      if (staffPhoto) {
        photoUrl = await uploadStaffImage(staffPhoto);
      }

      const payload = {
        staff_photo_url: photoUrl,
        staff_name: staffName.trim(),
        contact_info: contactInfo,
        position,
        background_summary: backgroundSummary,
        highlights: highlights.filter(Boolean).join("\n"),
        years_of_experience: yearsOfExperience.filter(Boolean).join("\n"),
      };

      let error;
      if (staffId) {
        ({ error } = await supabase
          .from("staff_background")
          .update(payload)
          .eq("id", staffId));
      } else {
        ({ error } = await supabase
          .from("staff_background")
          .insert([payload]));
      }

      if (error) throw error;

      alert(staffId ? "✅ Staff updated successfully!" : "✅ Staff added!");

    } catch (err) {
      alert("❌ Error saving staff background");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8ff] font-poppins text-black">
      <img src={IhcsHeader} alt="IHCS Header" className="w-full shadow-lg" />

      <nav className="w-full flex justify-between items-center px-8 py-5 bg-white shadow-lg border-b-4 border-blue-700">
        <Link to="/staff-landing-dashboard" className="text-xl font-extrabold">
          Staff Home
        </Link>

        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link to="/about-dashboard">About</Link>
          <span>/</span>
          <Link to="/staff-status-update" className="flex gap-2">
            <ClipboardCheck size={18} /> Status Update
          </Link>
          <span>/</span>
          <Link to="/staff-add-info" className="flex gap-2 text-blue-600">
            <PlusCircle size={20} /> Add Info
          </Link>
          <span>/</span>
          <button
            onClick={() => onLogout && onLogout(navigate)}
            className="text-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex justify-center flex-1 p-6">
        <div style={cardStyle}>
          <div style={titleStyle}>
            <User size={22} /> Staff Background Information
          </div>

          {/* ℹ️ INFO NOTE */}
          <div style={infoNoteStyle}>
            <strong>ℹ️ Updating a Staff Profile</strong>
            <br />
            To update an existing staff profile, please enter the
            <b> staff name</b> in the <b>Staff Name</b> field and then click enter key.
            <br />
            The system will automatically load the staff information.
            You can then edit the details and click <b>Update</b>.
          </div>

          <form style={formStyle}>
            <FormInput label="Staff Name" value={staffName} onChange={setStaffName} required />
            <FormInput label="Contact Info" value={contactInfo} onChange={setContactInfo} />
            <FormInput label="Position" value={position} onChange={setPosition} />

            <label style={labelStyle}>
              Staff Photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" style={photoPreviewStyle} />
              )}
            </label>

            <TextArea
              label="Background Summary"
              value={backgroundSummary}
              onChange={setBackgroundSummary}
              rows={4}
            />

            <MultiInput label="Highlights" values={highlights} setValues={setHighlights} />
            <MultiInput label="Years of Experience" values={yearsOfExperience} setValues={setYearsOfExperience} />

            <button
              type="button"
              style={saveButtonStyle}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving…" : staffId ? "🔄 Update" : "💾 Save"}
            </button>
          </form>
        </div>
      </main>

      <img src={IhcsFooter} alt="IHCS Footer" className="w-full shadow-lg" />
    </div>
  );
}

/* 🧩 Helpers */

function FormInput({ label, value, onChange, required }) {
  return (
    <label style={labelStyle}>
      {label} {required && "*"}
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

function MultiInput({ label, values, setValues }) {
  return (
    <label style={labelStyle}>
      {label}
      {values.map((val, i) => (
        <div key={i} className="flex gap-3 mt-2">
          <input
            value={val}
            onChange={(e) => {
              const copy = [...values];
              copy[i] = e.target.value;
              setValues(copy);
            }}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-[#05014a]"
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => setValues(values.filter((_, idx) => idx !== i))}
              className="px-4 bg-red-500 text-white rounded-xl"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setValues([...values, ""])}
        className="mt-2 text-sm text-blue-600 font-semibold"
      >
        ➕ Add another
      </button>
    </label>
  );
}

/* 🎨 Styles */
const cardStyle = {
  width: "700px",
  background: "linear-gradient(135deg,#fff 60%,#dbe5ff)",
  border: "4px solid #05014a",
  borderRadius: "48px",
};

const titleStyle = {
  padding: "20px 36px 0",
  fontWeight: 600,
  display: "flex",
  gap: "8px",
};

const infoNoteStyle = {
  margin: "16px 36px",
  padding: "14px 18px",
  background: "linear-gradient(135deg, #eef3ff, #dbe5ff)",
  borderLeft: "6px solid #0021f3",
  borderRadius: "16px",
  fontSize: "14px",
  lineHeight: "1.6",
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
  padding: "10px",
  borderRadius: "13px",
  border: "2px solid #05014a",
};

const photoPreviewStyle = {
  marginTop: "10px",
  width: "64px",
  height: "64px",
  borderRadius: "14px",
};

const saveButtonStyle = {
  marginTop: "20px",
  padding: "14px",
  background: "#0021f3",
  color: "#fff",
  borderRadius: "13px",
};
