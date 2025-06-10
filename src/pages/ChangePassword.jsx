import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    )
      return "Strong";
    return "Medium";
  };

  const strengthColor = {
    Weak: "text-red-500",
    Medium: "text-yellow-600",
    Strong: "text-green-600",
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    const strength = getPasswordStrength(newPassword);
    if (strength === "Weak") {
      setError(
        "Password is too weak. Use at least 6 characters with a mix of letters and numbers."
      );
      return;
    }

    try {
      setLoading(true);
      await apiBase.changePassword(currentPassword, newPassword);
      setMessage("Password changed successfully.");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Change Password
        </h2>
        <form className="space-y-6" onSubmit={handleChangePassword}>
          {error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded bg-green-50 p-2 text-sm text-green-700">
              {message}
            </div>
          )}

          <input
            type="password"
            placeholder="Current Password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {newPassword && (
            <p
              className={`text-sm font-medium ${strengthColor[passwordStrength]}`}
            >
              Strength: {passwordStrength}
            </p>
          )}
          <input
            type="password"
            placeholder="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="text-right text-sm">
            <Link to="/" className="text-indigo-600 hover:underline">
              Cancel
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
