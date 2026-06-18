import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const summaryCards = [
  { key: "totalClosingAmount", label: "Opening Amount", color: "#0f766e" },
  { key: "totalReceivedAmount", label: "Current Received Amount", color: "#0284c7" },
  { key: "totalCurrentAmount", label: "Current Amount", color: "#2563eb" },
  { key: "totalProjectionAmount", label: "Projection Amount", color: "#7c3aed" },
  { key: "totalLaibilityAmount", label: "Liability Amount", color: "#dc2626" },
  { key: "totalPendingApprovalAmount", label: "Pending Approval Amount", color: "#d97706" },
];

export default function AdminDashboard({ userType, id }) {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [includeProjectionAmountBeforeXMinutes, setIncludeProjectionAmountBeforeXMinutes] = useState(false);
  const [showProjectionAmountBeforeXMinutes, setShowProjectionAmountBeforeXMinutes] = useState(false);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
  });

  useEffect(() => {
    fetchLiabilities(false);
  }, []);

  const fetchLiabilities = async (
    includeBeforeXMinutes = includeProjectionAmountBeforeXMinutes
  ) => {
    try {
      setLoading(true);
      const retailerData = await apiBase.getLiabilityAmountOfAllRetailers(
        id,
        userType,
        includeBeforeXMinutes
      );

      setLiabilities(retailerData || []);
      setShowProjectionAmountBeforeXMinutes(includeBeforeXMinutes);

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
      const totalReceivedAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ReceivedAmount || 0),
        0
      );

      setSummary({
        totalLaibilityAmount,
        totalPendingApprovalAmount,
        totalProjectionAmount,
        totalRejectedAmount,
        totalCurrentAmount,
        totalClosingAmount,
        totalReceivedAmount,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <HeaderActions
        includeProjectionAmountBeforeXMinutes={includeProjectionAmountBeforeXMinutes}
        loading={loading}
        onChangeIncludeProjection={(checked) =>
          setIncludeProjectionAmountBeforeXMinutes(checked)
        }
        onLoad={() => fetchLiabilities()}
      />

      {error && <div className="text-red-600">{error}</div>}

      {liabilities.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="py-2">
            <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
          <RetailerLiabilityTable
            data={liabilities}
            showProjectionAmountBeforeXMinutes={showProjectionAmountBeforeXMinutes}
          />
        </div>
      )}
    </div>
  );
}

function SliderToggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`app-switch ${checked ? "is-active" : ""}`}
      >
        <span className="app-switch-thumb" />
      </button>
    </div>
  );
}

function CenterLoader({ label = "Loading..." }) {
  return (
    <div className="app-loading-state">
      <div className="app-loading-card">
        <div className="app-spinner" />
        <div className="app-loading-label">{label}</div>
      </div>
    </div>
  );
}

function HeaderActions({
  includeProjectionAmountBeforeXMinutes,
  loading,
  onChangeIncludeProjection,
  onLoad,
}) {
  const target = typeof document !== "undefined"
    ? document.getElementById("page-header-actions")
    : null;

  if (!target) return null;

  return createPortal(
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <SliderToggle
        checked={includeProjectionAmountBeforeXMinutes}
        onChange={onChangeIncludeProjection}
        label="Include Projection Amount Before X Minutes"
      />
      <button
        type="button"
        onClick={onLoad}
        disabled={loading}
        className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load Liabilities"}
      </button>
    </div>,
    target
  );
}

