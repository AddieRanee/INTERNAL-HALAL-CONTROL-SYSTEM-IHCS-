// src/pages/Auth.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

// Assets
import logo from "../assets/logo.png";

// Components
import GradientText from "../components/GradientText";
import Silk from "../components/Silk";

// Shimmer Button
const ShimmerButton = ({ children, onClick, type = "button", gradient, disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`relative w-full py-3 rounded-xl font-bold text-white shadow-lg overflow-hidden transition-transform ${
      disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.03]"
    } ${gradient}`}
  >
    <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
    <span className="relative z-10">{children}</span>
  </button>
);

export default function AuthUI() {
  const navigate = useNavigate();

  // UI state
  const [authType, setAuthType] = useState(""); // "staff" | "client"
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const resetForm = () => {
    setPassword("");
    setShowPassword(false);
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ===== Forgot Password =====
  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) alert(error.message);
    else alert("Password reset email sent 📩");
  };

  // ===== Register =====
const handleRegister = async () => {
  if (!authType) throw new Error("Please choose Staff or Client");
  setLoading(true);

  try {
    // 1️⃣ Sign up user and send metadata for profile
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          first_name: firstName || null,
          company_name: authType === "client" ? companyName || null : null,
          role: authType,
          staff_approved: authType === "staff" ? false : true,
        },
      },
    });

    if (signUpError) throw signUpError;
    if (!signUpData?.user?.id) throw new Error("Signup failed, no user returned");

    const userId = signUpData.user.id;

    // 2️⃣ Insert profile manually
    await supabase.from("profiles").insert({
      id: userId,
      role: authType,
      first_name: firstName || null,
      company_name: authType === "client" ? companyName || null : null,
      staff_approved: authType === "staff" ? false : true,
      email: email,
    });

    // 3️⃣ Staff vs client messaging
    if (authType === "staff") {
      alert("Staff request submitted. Await admin approval.");
    } else {
      alert("Registration successful! Please login to continue.");
    }

    // 4️⃣ Reset form & go back to auth selection
    setIsRegister(false);
    setAuthType(""); // back to main auth page
    resetForm();

  } catch (err) {
    console.error(err);
    const message = err?.message || "Something went wrong during registration";
    if (message.toLowerCase().includes("rate limit")) {
      alert("Too many attempts. Please wait a moment and try again.");
      setCooldown(10);
    } else {
      alert(message);
    }
  } finally {
    setLoading(false);
  }
};

  // ===== Login =====
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data?.user) throw new Error("Login failed");

      await supabase.auth.getSession();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, staff_approved")
        .eq("id", data.user.id)
        .single();
      if (profileError) throw profileError;

      if (profile.role === "staff" && !profile.staff_approved) {
        await supabase.auth.signOut();
        throw new Error("Staff account pending admin approval");
      }

      navigate(profile.role === "staff" ? "/staff-landing-dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const message = err?.message || "Login failed";
      if (message.toLowerCase().includes("email not confirmed")) {
        alert("Your email is not confirmed yet. Please check your inbox and confirm, then try again.");
      } else if (message.toLowerCase().includes("rate limit")) {
        alert("Too many attempts. Please wait a moment and try again.");
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Submit Handler =====
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!authType) return alert("Please choose Staff or Client");

    if (isRegister) await handleRegister();
    else await handleLogin();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Silk color="#0d47a1" speed={5} noiseIntensity={1.5} scale={1.2} />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <img src={logo} alt="Logo" className="mx-auto w-36 mb-6" />

        {!authType ? (
          <div className="text-center space-y-8">
            <GradientText
              colors={["#3b82f6", "#8b5cf6", "#ef4444"]}
              className="text-4xl font-extrabold"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Welcome to IHCS
            </GradientText>

            <div className="grid grid-cols-1 gap-6 mt-2">
              <button
                type="button"
                onClick={() => setAuthType("staff")}
                className="w-full text-left rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-5 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div
                      className="text-lg font-extrabold"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      Staff Sign-In
                    </div>
                    <div className="text-sm text-indigo-100">
                      Internal team access
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                    ST
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAuthType("client")}
                className="w-full text-left rounded-2xl border border-blue-200 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-5 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div
                      className="text-lg font-extrabold"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      Client Sign-In
                    </div>
                    <div className="text-sm text-blue-100">
                      Company access
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
                    CL
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            <GradientText
              colors={["#3b82f6", "#8b5cf6", "#ef4444"]}
              className="text-3xl font-extrabold text-center"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {isRegister
                ? authType === "staff"
                  ? "Staff Registration"
                  : "Client Registration"
                : authType === "staff"
                ? "Staff Sign-In"
                : "Client Sign-In"}
            </GradientText>

            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="First Name (optional)"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border"
                />
                {authType === "client" && (
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border"
                  />
                )}
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 border"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-16 rounded-xl bg-gray-100 border"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {!isRegister && (
              <p className="text-right text-sm text-indigo-500 cursor-pointer" onClick={handleForgotPassword}>
                Forgot password?
              </p>
            )}

            <ShimmerButton
              type="submit"
              disabled={loading || (isRegister && cooldown > 0)}
              gradient="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600"
            >
              {loading
                ? "Processing..."
                : isRegister && cooldown > 0
                  ? `Wait ${cooldown}s`
                  : isRegister
                    ? "Register"
                    : "Sign In"}
            </ShimmerButton>

            <p className="text-center text-sm">
              {isRegister ? "Already have an account?" : "No account?"}{" "}
              <span className="text-indigo-500 cursor-pointer" onClick={() => setIsRegister((v) => !v)}>
                {isRegister ? "Sign In" : "Register"}
              </span>
            </p>

            <p
              className="text-center text-xs cursor-pointer text-gray-500"
              onClick={() => {
                setAuthType("");
                setIsRegister(false);
                resetForm();
              }}
            >
              ← Back
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
