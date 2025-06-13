import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";

export default function SignIn() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showManualRegisterModal, setShowManualRegisterModal] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");
  // At the top in useState section
  const [dialogError, setDialogError] = useState(null);
  const [autoDialogError, setAutoDialogError] = useState(null);

  const [showUsernamePromptModal, setShowUsernamePromptModal] = useState(false);
  const [biometricUserName, setBiometricUserName] = useState("");
  const [showPostFailureOptions, setShowPostFailureOptions] = useState(false);

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

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("lastUserId");
      if (!storedUser) {
        setShowUsernamePromptModal(true);
        return;
      }

      const serverOptions = await apiBase.webauthnAuthenticateStart(storedUser);

      const options = {
        publicKey: {
          ...serverOptions,
          challenge: bufferDecode(serverOptions.challenge),
          allowCredentials: (serverOptions.allowCredentials || []).map(
            (cred) => ({
              ...cred,
              id: bufferDecode(cred.id),
            })
          ),
        },
      };

      const assertion = await navigator.credentials.get(options);
      const transformed = transformAssertion(assertion);

      const result = await apiBase.webauthnAuthenticateVerify({
        credential: transformed,
        userName: storedUser,
      });

      if (result?.success) {
        localStorage.setItem("jwt", result.token);
        localStorage.setItem("lastUserId", storedUser);
        navigate("/");
      } else {
        setShowPostFailureOptions(true);
      }
    } catch (err) {
      console.error("Biometric login failed", err);
      setShowPostFailureOptions(true);
    } finally {
      setLoading(false);
    }
  };

  const transformAssertion = (credential) => ({
    id: credential.id,
    rawId: bufferEncode(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferEncode(credential.response.authenticatorData),
      clientDataJSON: bufferEncode(credential.response.clientDataJSON),
      signature: bufferEncode(credential.response.signature),
      userHandle: credential.response.userHandle
        ? bufferEncode(credential.response.userHandle)
        : null,
    },
    extensions: credential.getClientExtensionResults(),
  });

  const transformAttestation = (credential) => ({
    id: bufferEncode(credential.rawId),
    rawId: bufferEncode(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferEncode(credential.response.attestationObject),
      clientDataJSON: bufferEncode(credential.response.clientDataJSON),
    },
    extensions: credential.getClientExtensionResults(),
  });

  function bufferDecode(value) {
    // Convert from Base64URL to regular Base64
    value = value.replace(/-/g, "+").replace(/_/g, "/");
    // Pad with '=' if needed
    const padLength = (4 - (value.length % 4)) % 4;
    value += "=".repeat(padLength);

    const binary = atob(value);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  function bufferEncode(value) {
    return btoa(String.fromCharCode(...new Uint8Array(value)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function bufferEncode(value) {
    return btoa(String.fromCharCode(...new Uint8Array(value)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function transformToAuthenticatorAttestationRawResponse(credential) {
    return {
      id: bufferEncode(credential.rawId), // maps to byte[] Id
      rawId: bufferEncode(credential.rawId), // maps to byte[] RawId
      type: credential.type, // maps to PublicKeyCredentialType
      response: {
        attestationObject: bufferEncode(credential.response.attestationObject), // byte[]
        clientDataJSON: bufferEncode(credential.response.clientDataJSON), // byte[]
      },
      extensions: credential.getClientExtensionResults(), // maps to AuthenticationExtensionsClientOutputs
    };
  }

  const handleBiometricRegistration = async () => {
    try {
      const uname = showManualRegisterModal ? registerUserName : userName;

      if (!uname) {
        const errMsg = "Please enter a username.";
        showManualRegisterModal
          ? setDialogError(errMsg)
          : setAutoDialogError(errMsg);
        return;
      }

      const registerOptions = await apiBase.webauthnRegisterStart(uname);

      if (!registerOptions?.challenge || !registerOptions?.user?.id) {
        throw new Error("Invalid registration options from server");
      }

      // Convert base64-encoded properties to Uint8Array
      const publicKey = {
        ...registerOptions,
        challenge: bufferDecode(registerOptions.challenge),
        user: {
          ...registerOptions.user,
          id: bufferDecode(registerOptions.user.id),
        },
        excludeCredentials: (registerOptions.excludeCredentials || []).map(
          (cred) => ({
            ...cred,
            id: bufferDecode(cred.id),
          })
        ),
      };

      // Prompt user for biometric registration
      const newCredential = await navigator.credentials.create({ publicKey });

      // Transform credential into JSON-ready data for your server
      const credentialData =
        transformToAuthenticatorAttestationRawResponse(newCredential);

      // Send it to server for verification
      const result = await apiBase.webauthnVerify({
        credential: credentialData,
        userName: uname,
      });

      if (result?.success) {
        localStorage.setItem("lastUserId", uname);
        alert("Registration successful. You can now use fingerprint login.");
        setShowManualRegisterModal(false);
        setDialogError(null);
        setAutoDialogError(null);
      } else {
        const errMsg = "Fingerprint registration failed.";
        showManualRegisterModal
          ? setDialogError(errMsg)
          : setAutoDialogError(errMsg);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg = "Registration failed due to a browser or server error.";
      showManualRegisterModal
        ? setDialogError(errMsg)
        : setAutoDialogError(errMsg);
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
                onClick={handleBiometricLogin}
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

      {showUsernamePromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Enter User ID for Biometric Login
            </h3>
            <input
              type="text"
              className="mt-3 w-full rounded-md border p-2"
              value={biometricUserName}
              onChange={(e) => setBiometricUserName(e.target.value)}
              placeholder="User ID"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                onClick={() => setShowUsernamePromptModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                onClick={async () => {
                  if (!biometricUserName) return;
                  localStorage.setItem("lastUserId", biometricUserName);
                  setShowUsernamePromptModal(false);
                  await handleBiometricLogin();
                }}
              >
                Proceed
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
