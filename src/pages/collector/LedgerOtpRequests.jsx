import React, { useCallback, useEffect, useState } from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";

const formatDate = (value) => value ? new Date(value).toLocaleString() : "-";

export default function LedgerOtpRequests({ collectorUserId }) {
  useDocumentTitle("OTP Requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    if (!collectorUserId) return;
    try {
      setError("");
      setRequests(await apiBase.getLedgerOtpRequests(collectorUserId) || []);
    } catch (err) {
      setError(err.message || "Unable to load OTP requests.");
    } finally {
      setLoading(false);
    }
  }, [collectorUserId]);

  useEffect(() => {
    loadRequests();
    const timer = setInterval(loadRequests, 30000);
    return () => clearInterval(timer);
  }, [loadRequests]);

  const generateOtp = async (request) => {
    setBusyId(request.RequestId);
    try {
      const result = await apiBase.generateLedgerOtpForRequest(request.RequestId, collectorUserId);
      if (!result?.Response) throw new Error(result?.Message || "OTP could not be generated.");
      window.alert(`OTP for ${request.RetailerName || request.RetailerId}: ${result.Otp}\nRequest ID: ${request.RequestId}`);
      await loadRequests();
    } catch (err) {
      window.alert(err.message || "OTP could not be generated.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">OTP Requests</h1>
          <p className="text-sm text-slate-500">Generate a one-time OTP after verifying the retailer request.</p>
        </div>
        <button className="app-button-secondary" onClick={loadRequests}>Refresh</button>
      </div>
      {error && <div className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="app-table-shell min-h-0 flex-1 overflow-auto">
        <table className="app-table min-w-full text-sm">
          <thead>
            <tr>
              <th>Retailer</th><th>Amount</th><th>Unique ID</th><th>Requested</th><th>Expires</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && requests.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No pending OTP requests.</td></tr>
            )}
            {requests.map((request) => (
              <tr key={request.RequestId}>
                <td>{request.RetailerName || request.RetailerId}</td>
                <td>Rs {Number(request.Amount || 0).toFixed(2)}</td>
                <td className="font-mono text-xs">{request.RequestId}</td>
                <td>{formatDate(request.CreatedOn)}</td>
                <td>{formatDate(request.ExpiresOn)}</td>
                <td>
                  <button className="app-button-primary text-xs" disabled={busyId === request.RequestId}
                    onClick={() => generateOtp(request)}>
                    {busyId === request.RequestId ? "Generating..." : "Verify and Generate OTP"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
