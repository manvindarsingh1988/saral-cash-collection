import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const summaryCards = [
  { key: "totalClosingAmount", label: "Opening Amount", color: "#0f766e" },
  { key: "totalLaibilityAmount", label: "Liability Amount", color: "#dc2626" },
  { key: "totalPendingApprovalAmount", label: "Pending Approval Amount", color: "#d97706" },
  { key: "totalProjectionAmount", label: "Projection Amount", color: "#7c3aed" },
  { key: "totalCurrentAmount", label: "Current Amount", color: "#2563eb" },
];

export default function RetailerLiabilitiesForCollector({ collectorUserId }) {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
  });

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      setLoading(true);
      const retailerData = await apiBase.getLiabilityAmountOfAllRetailersByCollectorId(
        collectorUserId
      );

      setLiabilities(retailerData || []);

      const totalLaibilityAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.LaibilityAmount || 0),
        0
      );
      const totalPendingApprovalAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.PendingApprovalAmount || 0),
        0
      );
      const totalProjectionAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ProjectionAmount || 0),
        0
      );
      const totalRejectedAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.RejectedAmount || 0),
        0
      );
      const totalCurrentAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.CurrentAmount || 0),
        0
      );
      const totalClosingAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ClosingAmount || 0),
        0
      );

      setSummary({
        totalLaibilityAmount,
        totalPendingApprovalAmount,
        totalProjectionAmount,
        totalRejectedAmount,
        totalCurrentAmount,
        totalClosingAmount,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const hasData = liabilities.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {loading && (
        <div className="app-loading-state">
          <div className="app-loading-card">
            <div className="app-spinner" />
            <div className="app-loading-label">Loading liabilities...</div>
          </div>
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && hasData && (
        <>
          <div className="rounded-lg py-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 mb-4">
              {summaryCards.map(({ key, label, color }) => (
                <div key={key} className="metric-tile" style={{ "--tile-color": color }}>
                  <dt className="metric-tile-label truncate">{label}</dt>
                  <dd className="metric-tile-value">
                    Rs {formatIndianNumber(summary[key])}
                  </dd>
                </div>
              ))}
            </div>
          </div>
          <RetailerLiabilityTable data={liabilities} />
        </>
      )}
    </div>
  );
}
