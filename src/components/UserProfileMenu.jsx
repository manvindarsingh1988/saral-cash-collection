import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiBase } from "../lib/apiBase";
import {
  bufferDecode,
  getLoginId,
  transformToAuthenticatorAttestationRawResponse,
} from "../lib/utils";

export default function UserProfileMenu({ user, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [showManualRegisterModal, setShowManualRegisterModal] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [ismPinExists, setIsmPinExists] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null); // Optional: show status

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkMpinExists = async () => {
      try {
        const uname = getLoginId();
        if (!uname) {
          console.error("LoginId not found. Please log in again.");
          return;
        }
        const response = await apiBase.ismPinExists(uname);
        if (response?.Response) {
          setIsmPinExists(response.Response);
          setDialogError("mPIN already exists. Please use a different method.");
        }
      } catch (error) {
        console.error("Error checking mPIN existence:", error);
        setIsmPinExists(false);
      }
    };
    if (showManualRegisterModal) checkMpinExists();
  }, [showManualRegisterModal]);

  const handleEnableNotifications = async () => {
    try {
      await apiBase.subscribeUser();
      setNotificationStatus("Notifications enabled");
    } catch (err) {
      console.error("Failed to enable notifications", err);
      setNotificationStatus("Failed to enable notifications");
    } finally {
      setShowMenu(false);
    }
  };

  const handleBiometricRegistration = async () => {
    try {
      const uname = getLoginId();

      if (!uname) {
        const errMsg = "LoginId not found. Please log in again.";
        setDialogError(errMsg);

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
      } else {
        const errMsg = "Fingerprint registration failed.";
        setDialogError(errMsg);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg = "Registration failed due to a browser or server error.";
      setDialogError(errMsg);
      setShowManualRegisterModal(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-white flex items-center space-x-2 px-3 py-2 text-sm font-medium hover:bg-indigo-700 rounded focus:outline-none"
        >
          <div className="text-left truncate max-w-[100px] sm:max-w-[160px]">
            <div className="font-semibold">{user?.UserName || "User"}</div>
            <div className="text-xs opacity-80">{user?.UserType || "Role"}</div>
          </div>
          <svg
            className="ml-1 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                navigate("/change-password");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Change Password
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                setShowManualRegisterModal(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
            >
              Register with mPIN
            </button>

            <button
              onClick={handleEnableNotifications}
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
            >
              Enable Notifications
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                onSignOut();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {notificationStatus && (
        <div className="absolute top-full mt-1 text-xs text-green-600">
          {notificationStatus}
        </div>
      )}

      {/* Manual registration modal with input */}
      {showManualRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              Register mPIN
            </h3>

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
                disabled={ismPinExists}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
                onClick={handleBiometricRegistration}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
