import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  /* 🔐 Check recovery session */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Invalid or expired reset link. Please try again.");
        navigate("/auth", { replace: true });
        return;
      }

      setSessionReady(true);
    };

    checkSession();
  }, [navigate]);

  /* 🔄 Handle password reset */
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset successful! Please log in again.");
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="animate-pulse text-gray-600">
          Verifying reset link…
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-blue-100 p-8">
        {/* IHCS Title */}
        <h1 className="text-center text-3xl font-bold text-blue-700 mb-2">
          IHCS
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Reset Your Password
        </p>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>

        {/* Back to Login */}
        <button
          onClick={() => navigate("/auth")}
          className="w-full mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
