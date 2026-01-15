import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import IhcsHeader from "../assets/IHCS_header_pic.png";
import IhcsFooter from "../assets/IHCS_Footer_pic.png";
import { ClipboardList } from "lucide-react";

export default function ProductList() {
  const { companyInfoId: paramCompanyInfoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userId: passedUserId, companyInfoId: passedCompanyInfoId } =
    location.state || {};

  const [userId, setUserId] = useState(passedUserId || null);
  const [companyInfoId, setCompanyInfoId] = useState(
    paramCompanyInfoId || passedCompanyInfoId || null
  );

  const [products, setProducts] = useState([{ menu: "", ingredients: "" }]);
  const [isSaving, setIsSaving] = useState(false);

  // Topic Header Inputs
  const [implementationDate, setImplementationDate] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [reviewNo, setReviewNo] = useState("");

  // ---------------- AUTH ----------------
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
    };

    fetchUser();
  }, [userId, navigate]);

  // ---------------- FETCH COMPANY INFO ----------------
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (companyInfoId || !userId) return;

      const { data, error } = await supabase
        .from("company_info")
        .select("id")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.id) {
        setCompanyInfoId(data.id);
      }
    };
    fetchCompanyInfo();
  }, [userId, companyInfoId]);

  // ---------------- FETCH EXISTING PRODUCTS ----------------
  useEffect(() => {
    const fetchProducts = async () => {
      if (!companyInfoId) return;

      const { data, error } = await supabase
        .from("product_list")
        .select(
          "product_name, ingredients_raw_materials, implementation_date, reference_no, review_no"
        )
        .eq("company_info_id", companyInfoId);

      if (error) {
        console.error("❌ Error fetching products:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const formatted = data.map((item) => ({
          menu: item.product_name || "",
          ingredients: Array.isArray(item.ingredients_raw_materials)
            ? item.ingredients_raw_materials.join(", ")
            : "",
        }));

        setProducts(formatted.length ? formatted : [{ menu: "", ingredients: "" }]);
        setImplementationDate(data[0]?.implementation_date || "");
        setReferenceNo(data[0]?.reference_no || "");
        setReviewNo(data[0]?.review_no || "");
      } else {
        setProducts([{ menu: "", ingredients: "" }]);
        setImplementationDate("");
        setReferenceNo("");
        setReviewNo("");
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [companyInfoId]);

  // ---------------- HANDLE INPUT ----------------
  const handleChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addRow = () =>
    setProducts([...products, { menu: "", ingredients: "" }]);

  const removeRow = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated.length ? updated : [{ menu: "", ingredients: "" }]);
  };

  // ---------------- SAVE PRODUCTS ----------------
  const saveProducts = async () => {
    if (!companyInfoId) {
      alert("❌ Missing Company Info ID.");
      return null;
    }

    const cleanProducts = products.filter(
      (p) => p.menu.trim() !== "" || p.ingredients.trim() !== ""
    );

    setIsSaving(true);

    await supabase.from("product_list").delete().eq("company_info_id", companyInfoId);

    const rowsToInsert =
      cleanProducts.length > 0
        ? cleanProducts.map((p) => ({
            company_info_id: companyInfoId,
            product_name: p.menu,
            ingredients_raw_materials: p.ingredients
              ? p.ingredients.split(",").map((x) => x.trim())
              : [],
            implementation_date: implementationDate,
            reference_no: referenceNo,
            review_no: reviewNo,
          }))
        : [
            {
              company_info_id: companyInfoId,
              product_name: "",
              ingredients_raw_materials: [],
              implementation_date: implementationDate,
              reference_no: referenceNo,
              review_no: reviewNo,
            },
          ];

    const { data, error } = await supabase
      .from("product_list")
      .insert(rowsToInsert)
      .select();

    setIsSaving(false);

    if (error) {
      alert("❌ Error saving: " + error.message);
      return null;
    }

    alert("✅ Product list saved successfully!");
    return data;
  };

  // ---------------- BUTTONS ----------------
  const handleSaveBtn = async () => {
    const data = await saveProducts();
    if (data) {
      navigate("/rawmaterialmaster", { state: { userId, companyInfoId } });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextBtn = () => {
    navigate("/rawmaterialmaster", { state: { userId, companyInfoId } });
  };

  const handleBackBtn = () => {
    navigate("/halalpolicy", { state: { userId, companyInfoId } });
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8ff] font-poppins text-black">
      {/* HEADER */}
      <img src={IhcsHeader} className="w-full h-auto object-cover shadow-lg rounded-b-3xl" />

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 sticky top-0 z-10">
        <a href="/" className="text-xs font-extrabold">Home</a>
        {/* Removed About / Features / Contact */}
        <div></div>
      </nav>

      {/* MAIN */}
      <main className="flex justify-center items-center flex-1 p-6">
        <div
          style={{
            width: "800px",
            maxWidth: "95vw",
            background: "linear-gradient(135deg,#ffffff 60%,#dbe5ff 100%)",
            padding: "20px 22px 40px 22px",
            borderRadius: "48px",
            border: "4px solid #05014a",
            boxShadow: "0 8px 40px #0021f344",
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
            <ClipboardList size={22} color="#05014a" />
            Product List
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
              📘 Topic 4: Product List
            </h3>

            <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
              This section records your company’s product list and their respective raw materials.
            </p>

            {/* INPUTS */}
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <label style={{ fontWeight: "600" }}>Implementation Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={implementationDate}
                  onChange={(e) => setImplementationDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontWeight: "600" }}>Reference Number</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontWeight: "600" }}>Review Number</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={reviewNo}
                  onChange={(e) => setReviewNo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#e6ecff" }}>
                <th style={thStyle}>Menu</th>
                <th style={thStyle}>Ingredients & Raw Materials</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={row.menu}
                      onChange={(e) =>
                        handleChange(idx, "menu", e.target.value)
                      }
                      placeholder="Enter menu item"
                    />
                  </td>

                  <td style={tdStyle}>
                    <textarea
                      rows={2}
                      style={textareaStyle}
                      value={row.ingredients}
                      onChange={(e) =>
                        handleChange(idx, "ingredients", e.target.value)
                      }
                      placeholder="Comma-separated"
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

          <button type="button" onClick={addRow} style={addButtonStyle}>
            + Add Row
          </button>

          <button
            type="button"
            onClick={handleSaveBtn}
            style={{ ...saveButtonStyle }}
          >
            {isSaving ? "💾 Saving..." : "💾 Save & Continue"}
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
        className="w-full h-auto object-cover shadow-lg rounded-t-3xl"
      />
    </div>
  );
}

/* ---------------- Styles ---------------- */
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
};

const textareaStyle = { ...inputStyle, resize: "vertical" };

const removeButtonStyle = {
  background: "#ff4d4d",
  border: "none",
  color: "white",
  borderRadius: "8px",
  padding: "6px 10px",
  cursor: "pointer",
};

const addButtonStyle = {
  marginTop: "10px",
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
