// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

// === Images ===
import logo from "../assets/logo.png";

// === Components ===
import GradientText from "../components/GradientText";
import Silk from "../components/Silk";

// ========== Shimmer Button ==========
const ShimmerButton = ({ children, onClick, type = "button", gradient, disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`relative w-full py-3 rounded-xl font-bold text-white shadow-lg overflow-hidden group transition-transform ${
      disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.03]"
    } ${gradient}`}
  >
    <span className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
    <span className="relative z-10">{children}</span>
  </button>
);

// ========== Main Auth Component ==========
export default function AuthUI() {
  const navigate = useNavigate();

  const [authType, setAuthType] = useState(null); // staff | client
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== Forgot Password =====
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert("Password reset link sent. Check your email 📩");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to send reset email");
    }
  };

  // ===== Login / Register =====
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // === REGISTER ===
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        alert("Signup successful! Please check your email to confirm before logging in.");
        setLoading(false);
        return;
      }

      // === LOGIN ===
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user ?? data?.session?.user;
      if (!user) throw new Error("Login failed. No user returned.");

      const userId = user.id;
      const chosen = authType?.toLowerCase();

      // === FAST REDIRECT ===
      if (chosen === "staff") {
        window.location.replace("/staff-landing-dashboard");
      } else if (chosen === "client") {
        window.location.replace("/dashboard");
      } else {
        (async () => {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", userId)
              .maybeSingle();

            const role = profile?.role?.toLowerCase();
            if (role === "staff") window.location.replace("/staff-landing-dashboard");
            else if (role === "client") window.location.replace("/dashboard");
            else alert("Role not defined. Contact admin.");
          } catch {
            alert("Unable to determine role. Contact admin.");
          }
        })();
      }

      // === Background profile insert (non-blocking) ===
      setTimeout(async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: userId,
            role: (authType || "client").toLowerCase(),
            first_name: firstName || null,
            company_name: authType === "client" ? companyName || null : null,
          });
        }
      }, 0);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Silk color="#0d47a1" speed={5} noiseIntensity={1.5} scale={1.2} />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-4">
        <div className="flex-1 max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
          <img src={logo} alt="Logo" className="mx-auto w-40 mb-6 animate-pulse" />

          {!authType ? (
            <div className="text-center">
              <GradientText
                colors={["#3b82f6", "#8b5cf6", "#ef4444"]}
                animationSpeed={6}
                className="text-4xl font-extrabold mb-2"
              >
                Welcome
              </GradientText>

              <p className="text-gray-600 mt-2">
                Choose your portal to continue
              </p>

              <div className="mt-6 space-y-4">
                <ShimmerButton
                  gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
                  onClick={() => setAuthType("staff")}
                >
                  Staff Portal
                </ShimmerButton>

                <ShimmerButton
                  gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
                  onClick={() => setAuthType("client")}
                >
                  Client Portal
                </ShimmerButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              <GradientText
                colors={["#3b82f6", "#8b5cf6", "#ef4444"]}
                animationSpeed={6}
                className="text-3xl font-extrabold text-center"
              >
                {isRegister ? `Register as ${authType}` : `Sign in to ${authType}`}
              </GradientText>

              {isRegister && (
                <>
                  <input
                    type="text"
                    placeholder="First Name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300"
                  />

                  {authType === "client" && (
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300"
                    />
                  )}
                </>
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-16 rounded-xl bg-gray-100 border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-indigo-500 hover:text-indigo-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* FORGOT PASSWORD */}
              {!isRegister && (
                <p
                  className="text-right text-sm text-indigo-500 cursor-pointer hover:underline"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </p>
              )}

              <ShimmerButton
                type="submit"
                gradient="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600"
                disabled={loading}
              >
                {loading ? "Processing..." : isRegister ? "Register" : "Sign In"}
              </ShimmerButton>

              <p className="text-center text-sm text-gray-600">
                {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
                <span
                  className="text-indigo-500 hover:underline cursor-pointer"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Sign In" : "Register"}
                </span>
              </p>

              <p
                className="text-center text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => {
                  setAuthType(null);
                  setIsRegister(false);
                }}
              >
                ← Back to portal selection
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
