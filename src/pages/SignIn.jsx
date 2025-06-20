import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await apiBase.signIn(email, password);
      setRequires2FA(true);
      setUserId(user.Id);
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (!code.trim()) {
      setError("Please enter the 2FA code.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiBase.twoFactorValidateLogin(userId, code);

      if (res.data.success) {
        navigate("/");
      } else {
        setError("Invalid 2FA code");
      }
    } catch (err) {
      setError("2FA verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            {requires2FA
              ? "Two-Factor Verification"
              : "Sign in to your account"}
          </h2>
        </div>

        {requires2FA ? (
          <>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code from Authenticator"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-600"
              />
              <button
                onClick={handle2FAVerify}
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4 rounded-md shadow-sm">
              <input
                id="email"
                name="email"
                type="text"
                required
                placeholder="User ID"
                className="w-full rounded-md border p-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full rounded-md border p-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                onClick={() => alert("Contact your admin to get your password")}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
