import React, { useState, useEffect } from "react";
import { apiBase } from "../lib/apiBase";

export default function Setup2FA() {
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const userId = apiBase.getCurrentUser()?.Id; // or get from context/state

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await apiBase.twoFactorInitiate(userId);
        setQrUrl(res.qrUrl);
        setSecret(res.secret);
      } catch (err) {
        setError("Failed to generate 2FA setup. Try again later.");
      }
    };

    fetchQR();
  }, [userId]);

  const handleVerify = async () => {
    try {
      const res = await apiBase.twoFactorVerify(userId, code);
      if (res.success) {
        setStatus("✅ Two-Factor Authentication has been enabled.");
        setError("");
      } else {
        setError("Invalid code. Try again.");
      }
    } catch {
      setError("Verification failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-12 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        Set Up Two-Factor Authentication
      </h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {status && <div className="text-green-600 mb-2">{status}</div>}
      <p className="mb-4">Scan this QR code using your Authenticator App:</p>
      {qrUrl && <img src={qrUrl} alt="2FA QR Code" className="mb-4" />}
      <p className="text-sm text-gray-600 mb-2">
        Or manually enter this secret key:
      </p>
      <div className="font-mono text-sm bg-gray-100 p-2 rounded mb-4">
        {secret}
      </div>
      <input
        type="text"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <button
        onClick={handleVerify}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
      >
        Verify & Enable 2FA
      </button>
    </div>
  );
}
