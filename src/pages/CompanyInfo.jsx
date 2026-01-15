// src/pages/CompanyInfo.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import IhcsHeader from '../assets/IHCS_header_pic.png';
import IhcsFooter from '../assets/IHCS_Footer_pic.png';
import React from 'react';
import { Building } from "lucide-react";

export default function CompanyInfo() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [ssmNo, setSsmNo] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [preparedBy, setPreparedBy] = useState({ name: '', position: '', date: '' });
  const [approvedBy, setApprovedBy] = useState({ name: '', position: '', date: '' });

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUserId(user.id);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // ---------------- LOGO PREVIEW ----------------
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else setLogoPreview('');
  };

  // ---------------- SAVE FORM ----------------
  const handleSave = async () => {
    if (!userId) return alert('You must be logged in to save company info.');

    let logoUrl = null;
    if (logo) {
      const filePath = `${userId}/${Date.now()}_${logo.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('ihcs-files')
        .upload(filePath, logo, { upsert: true });

      if (uploadError) return alert('Logo upload failed: ' + uploadError.message);

      const { data: urlData } = supabase
        .storage
        .from('ihcs-files')
        .getPublicUrl(filePath);

      logoUrl = urlData.publicUrl;
    }

    const payload = {
      user_id: userId,
      company_name: companyName,
      company_logo_url: logoUrl,
      ssm_no: ssmNo,
      address,
      prepared_by_name: preparedBy.name,
      prepared_by_position: preparedBy.position,
      prepared_date: preparedBy.date || null,
      approved_by_name: approvedBy.name,
      approved_by_position: approvedBy.position,
      approved_date: approvedBy.date || null
    };

    const { data, error } = await supabase
      .from('company_info')
      .upsert([payload], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return alert('Error saving company info: ' + error.message);

    alert('✅ Company info saved successfully!');

    navigate('/company-background', {
      state: {
        userId,
        companyInfo: data
      }
    });
  };

  // ---------------- NEXT BUTTON (SKIP SAVE) ----------------
  const handleNext = () => {
    if (!userId) return alert("You must be logged in.");

    const currentFormData = {
      company_name: companyName,
      ssm_no: ssmNo,
      address,
      company_logo_url: null,
      prepared_by_name: preparedBy.name,
      prepared_by_position: preparedBy.position,
      prepared_date: preparedBy.date || null,
      approved_by_name: approvedBy.name,
      approved_by_position: approvedBy.position,
      approved_date: approvedBy.date || null,
      user_id: userId,
      id: null
    };

    navigate('/company-background', {
      state: {
        userId,
        companyInfo: currentFormData
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-[#f4f8ff] font-poppins text-black">
      <div
        className="flex-1 flex flex-col"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'none',
        }}
      >
        <img src={IhcsHeader} alt="IHCS Header" className="w-full h-auto object-cover shadow-lg rounded-b-3xl" />

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-lg border-b-4 border-blue-700 relative z-10">
          <div className="flex justify-start">
            <Link
              to="/"
              className="text-xs font-extrabold text-black tracking-wide no-underline hover:text-blue-600 transition-colors duration-300 relative"
            >
              Home
            </Link>
          </div>
        </nav>

        {/* FORM */}
        <main className="flex items-center justify-center flex-1 p-6">
          <div
            className="relative"
            style={{
              width: '700px',
              maxWidth: '95vw',
              background: 'linear-gradient(135deg, #ffffff 60%, #dbe5ff 100%)',
              backdropFilter: 'blur(12px)',
              border: '4px solid #05014a',
              borderRadius: '48px',
              boxShadow: '0 8px 40px #0021f344',
              paddingBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* TITLE */}
            <div
              style={{
                width: '100%',
                padding: '20px 36px 0 36px',
                fontWeight: '600',
                fontSize: '1.15rem',
                color: 'black',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Building size={22} color="#05014a" /> Company Information
            </div>

            {/* NOTE */}
            <div style={{ padding: '0 36px', marginTop: '12px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #dbe7ff 0%, #bcd4ff 100%)',
                  border: '2px solid #0021f3',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  color: '#00186e',
                  fontWeight: '600',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                Reminder: You’ll need to fill in these company details each time you log in so the IHCS system can generate accurate reports.
              </div>
            </div>

            {/* FORM CONTENT */}
            <form
              className="flex-1"
              style={{
                padding: '0 22px 22px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                overflowY: 'auto'
              }}
            >
              <FormInput label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" required />
              <FormInput label="SSM Number" value={ssmNo} onChange={(e) => setSsmNo(e.target.value)} placeholder="Company SSM number" />
              <FormInput label="Company Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Company address" />

              <label style={labelStyle}>
                Company Logo
                <input type="file" accept="image/*" style={fileInputStyle} onChange={handleLogoChange} />
                {logoPreview && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={logoPreview} alt="Logo Preview" style={logoPreviewStyle} />
                    <span style={{ fontSize: '0.95rem', color: '#05014a' }}>Logo Preview</span>
                  </div>
                )}
              </label>

              <Section title="Prepared By" data={preparedBy} setData={setPreparedBy} />
              <Section title="Approved By" data={approvedBy} setData={setApprovedBy} />

              <button
                type="button"
                style={{
                  ...saveButtonStyle,
                  opacity: !companyName.trim() ? 0.6 : 1,
                  cursor: !companyName.trim() ? "not-allowed" : "pointer"
                }}
                onClick={handleSave}
                disabled={!companyName.trim()}
              >
                💾 Save
              </button>

              <button
                type="button"
                style={nextButtonStyle}
                onClick={handleNext}
                disabled={!userId}
              >
                ➡ Next
              </button>
            </form>
          </div>
        </main>

        <img src={IhcsFooter} alt="IHCS Footer" className="w-full h-auto object-cover shadow-lg rounded-t-3xl" />
      </div>
    </div>
  );
}

// ---------------- FORM INPUT COMPONENTS ----------------
function FormInput({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <label style={labelStyle}>
      <span>{label} {required && <span style={{ color: "red" }}>*</span>}</span>
      <input type={type} style={inputStyle} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function Section({ title, data, setData }) {
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px', color: 'black' }}>{title}</div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
        <input type="text" placeholder="Name" style={inputStyle} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        <input type="text" placeholder="Position" style={inputStyle} value={data.position} onChange={(e) => setData({ ...data, position: e.target.value })} />
      </div>
      <input type="date" style={inputStyle} value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
    </div>
  );
}

// ---------------- STYLES ----------------
const inputStyle = { width: '100%', marginTop: '4px', padding: '8px', borderRadius: '13px', border: '2px solid #05014a', fontSize: '1rem', color: 'black', outlineColor: '#2563eb' };
const fileInputStyle = { width: '100%', marginTop: '4px', fontSize: '1.05rem', border: 'none', borderBottom: '1px solid #0021f3', background: 'none' };
const logoPreviewStyle = { height: '52px', width: '52px', objectFit: 'contain', borderRadius: '13px', border: '2px solid #0021f3', boxShadow: '0 2px 8px #05014a55' };
const labelStyle = { fontWeight: '600', display: 'flex', flexDirection: 'column', color: 'black' };
const saveButtonStyle = { width: '100%', padding: '16px 0', background: 'linear-gradient(90deg,#05014a 0%,#0021f3 100%)', color: '#fff', border: '2px solid #05014a', borderRadius: '13px', fontSize: '1.15rem', fontWeight: '600', marginTop: '24px', boxShadow: '0 2px 14px #0021f355', cursor: 'pointer' };
const nextButtonStyle = { width: '100%', padding: '16px 0', background: 'linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)', color: '#fff', border: '2px solid #05014a', borderRadius: '13px', fontSize: '1.15rem', fontWeight: '600', marginTop: '12px', boxShadow: '0 2px 14px #0021f355', cursor: 'pointer' };
