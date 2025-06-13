import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

export default function SignIn() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showManualRegisterModal, setShowManualRegisterModal] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");
  // At the top in useState section
  const [dialogError, setDialogError] = useState(null);
  const [autoDialogError, setAutoDialogError] = useState(null);

  

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiBase.signIn(userName, password);
      localStorage.setItem("lastUserId", userName);
      navigate("/");
    } catch {
      alert("Invalid User ID or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = await apiBase.webauthnAuthenticateStart(userName);
      if (!options?.publicKey) {
        setShowRegisterModal(true);
        return;
      }

      const assertion = await navigator.credentials.get({
        publicKey: options.publicKey,
      });
      const result = await apiBase.webauthnVerify(assertion, userName);

      if (result?.success) {
        localStorage.setItem("lastUserId", userName);
        navigate("/");
      } else {
        setShowRegisterModal(true);
        setError("Biometric authentication failed.");
      }
    } catch (err) {
      setError("Biometric authentication is not available or failed.");
      setShowRegisterModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricRegistration = async () => {
    try {
      const uname = showManualRegisterModal ? registerUserName : userName;
      if (!uname) {
        if (showManualRegisterModal) {
          setDialogError("Please enter a username.");
        } else {
          setAutoDialogError("Username is missing.");
        }
        return;
      }

      const registerOptions = await apiBase.webauthnRegisterStart(uname);
      const newCredential = await navigator.credentials.create({
        publicKey: registerOptions.publicKey,
      });

      const result = await apiBase.webauthnVerify(newCredential, uname);
      if (result?.success) {
        localStorage.setItem("lastUserId", uname);
        alert("Registration successful. You can now use fingerprint login.");
        setShowManualRegisterModal(false);
        setShowRegisterModal(false);
        setDialogError(null);
        setAutoDialogError(null);
      } else {
        showManualRegisterModal
          ? setDialogError("Fingerprint registration failed.")
          : setAutoDialogError("Fingerprint registration failed.");
      }
    } catch (err) {
      console.error(err);
      showManualRegisterModal
        ? setDialogError("Registration failed due to a browser error.")
        : setAutoDialogError("Registration failed due to a browser error.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center text-2xl font-bold text-gray-900">
          Saral Cash Flow
        </div>
        <h3 className="text-center text-l text-gray-900">
          Sign in to your account
        </h3>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          {error && (
            <div className="rounded-md bg-red-100 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="User ID"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full rounded-md border p-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border p-2"
            />
          </div>

          <div className="flex justify-between">
            <Link
              onClick={() => alert("Contact your admin to get your password")}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {window.PublicKeyCredential && (
            <>
              <button
                type="button"
                onClick={handleBiometric}
                className="mt-4 w-full rounded-md border border-indigo-600 py-2 text-indigo-600 hover:bg-indigo-50 md:hidden"
              >
                Login with Fingerprint
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterUserName(userName); // Pre-fill from main form
                  setShowManualRegisterModal(true);
                }}
                className="w-full rounded-md border border-gray-600 py-2 text-gray-600 hover:bg-gray-50 md:hidden"
              >
                Register with Fingerprint
              </button>
            </>
          )}
        </form>
      </div>

      {/* Auto-prompted registration modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Not Registered
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              This username is not registered for biometric login. Do you want
              to register your fingerprint now?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                onClick={handleBiometricRegistration}
              >
                Register Fingerprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual registration modal with input */}
      {showManualRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Register Fingerprint
            </h3>

            <input
              type="text"
              placeholder="Enter Username"
              value={registerUserName}
              onChange={(e) => {
                setRegisterUserName(e.target.value);
                setDialogError(null);
              }}
              className="mt-3 w-full rounded-md border p-2"
            />

            {dialogError && (
              <div className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">
                {dialogError}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                onClick={() => {
                  setShowManualRegisterModal(false);
                  setDialogError(null);
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                onClick={handleBiometricRegistration}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
