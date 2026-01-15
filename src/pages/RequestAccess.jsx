import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Building2,
  ClipboardList,
  MessageSquare,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";

export default function RequestAccess() {
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [reason, setReason] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch logged-in user details (ID + email)
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      setUserId(data.user.id);
      setUserEmail(data.user.email);

      // Optional: auto-fill company from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", data.user.id)
        .single();

      if (profile?.company_name) {
        setCompanyName(profile.company_name);
      }
    };

    getUser();
  }, []);

  const handleCheckboxChange = (value) => {
    setReason((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]
    );
  };

  const handleFileUpload = async (userId) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (fileExt !== "pdf") {
      setMessage({ type: "error", text: "⚠️ Only PDF files are allowed." });
      return null;
    }

    const filePath = `access/${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("ihcs-files")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      setMessage({ type: "error", text: "❌ File upload failed. Try again." });
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ihcs-files")
      .getPublicUrl(filePath);

    console.log("✅ Uploaded file:", publicUrlData.publicUrl);
    return filePath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!userId) {
      setMessage({ type: "error", text: "⚠️ Please log in first." });
      setLoading(false);
      return;
    }

    const filePath = await handleFileUpload(userId);

    const finalReason = reason.includes("Other")
      ? [...reason.filter((r) => r !== "Other"), otherReason].join(", ")
      : reason.join(", ");

    const { error } = await supabase.from("access_requests").insert([
      {
        user_id: userId,
        email: userEmail,
        company_name: companyName,
        contact_number: contactNumber,
        reason: finalReason,
        file_path: filePath,
        status: "Pending",
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      setMessage({ type: "error", text: "❌ Something went wrong. Please try again." });
    } else {
      setMessage({
        type: "success",
        text: "✅ Request submitted successfully! Please wait for admin approval.",
      });
      setCompanyName("");
      setContactNumber("");
      setReason([]);
      setOtherReason("");
      setFile(null);

      setTimeout(() => navigate("/"), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-[#16192c] font-poppins">
      {/* Header */}
      <img src={IhcsHeader} alt="Header" className="w-full h-auto object-cover" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white border border-blue-200 shadow-2xl rounded-3xl p-10 w-full max-w-2xl transition transform hover:scale-[1.01] duration-300">
          <h1 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Request Access
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Company Name
              </label>
              <div className="flex items-center border rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-400 bg-gray-50">
                <Building2 className="text-blue-600 mr-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  required
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                PIC Contact Number
              </label>
              <div className="flex items-center border rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-400 bg-gray-50">
                <Phone className="text-blue-600 mr-3" />
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter contact number (e.g. 0123456789)"
                  pattern="[0-9]{10,15}"
                  required
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload SSM / Sijil Halal (PDF only)
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-5 cursor-pointer hover:bg-blue-50 transition">
                <Upload className="text-blue-600 mr-3" />
                <span className="text-sm">
                  {file ? file.name : "Click to upload or drag your file here"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reason for Access */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Reason for Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Renewal", "New Application", "Newly Established IHCS Member", "Other"].map(
                  (item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition ${
                        reason.includes(item)
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={reason.includes(item)}
                        onChange={() => handleCheckboxChange(item)}
                      />
                      <ClipboardList className="text-blue-600" size={18} />
                      <span>{item}</span>
                    </label>
                  )
                )}
              </div>

              {reason.includes("Other") && (
                <div className="mt-4 flex items-center border rounded-xl p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-400 transition">
                  <MessageSquare className="text-blue-600 mr-3" />
                  <input
                    type="text"
                    placeholder="Please specify your reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-full font-semibold shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>

          {message.text && (
            <div
              className={`mt-6 text-center text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                message.type === "success"
                  ? "text-green-700 bg-green-50"
                  : message.type === "error"
                  ? "text-red-700 bg-red-50"
                  : "text-blue-700 bg-blue-50"
              }`}
            >
              {message.type === "success" && <CheckCircle size={18} />}
              {message.type === "error" && <XCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <img src={IhcsFooter} alt="Footer" className="w-full h-auto object-cover" />
    </div>
  );
}
