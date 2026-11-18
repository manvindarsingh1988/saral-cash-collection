import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const summaryCards = [
  { key: "ProjectionAmount", label: "Retailer Closing Amount", color: "#7c3aed" },
  { key: "CombinedPendingApprovalAmount", label: "Pending Approval", color: "#d97706" },
  { key: "CurrentAmount", label: "Today Collection Amount", color: "#2563eb" },
];

export default function RetailerLiabilitiesForCollector({ collectorUserId }) {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [liability, setLiability] = useState({});
  const [groupByCity, setGroupByCity] = useState(false);
  const [groupByMarketLocation, setGroupByMarketLocation] = useState(false);

  useEffect(() => {
    fetchLiabilities();
  }, [collectorUserId]);

  const fetchLiabilities = async () => {
    try {
      setLoading(true);
      const [retailerData, collectorLiability] = await Promise.all([
        apiBase.getLiabilityAmountOfAllRetailersByCollectorId(collectorUserId),
        apiBase.getLiabilityAmountByCollectorId(collectorUserId),
      ]);

      setLiabilities(retailerData || []);
      setLiability(collectorLiability || {});
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const hasData = liabilities.length > 0;
  const summaryValues = {
    ...liability,
    CombinedPendingApprovalAmount:
      (Number(liability.RetailerInitiatedAmount) || 0) +
      (Number(liability.CollectorInitiatedAmount) || 0),
  };

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
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
              {summaryCards.map(({ key, label, color }) => (
                <div key={key} className="metric-tile" style={{ "--tile-color": color }}>
                  <dt className="metric-tile-label truncate">{label}</dt>
                  <dd className="metric-tile-value">
                    Rs {formatIndianNumber(summaryValues[key] || 0)}
                  </dd>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-4 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <span className="whitespace-nowrap">Group by</span>
            <GroupOption
              label="City"
              checked={groupByCity}
              onChange={() => {
                setGroupByCity((value) => !value);
                setGroupByMarketLocation(false);
              }}
            />
            <GroupOption
              label="Market Location"
              checked={groupByMarketLocation}
              onChange={() => {
                setGroupByMarketLocation((value) => !value);
                setGroupByCity(false);
              }}
            />
          </div>
          <RetailerLiabilityTable
            data={liabilities}
            visibleColumnKeys={["UserName", "ProjectionAmount", "DistributorCity", "Remark"]}
            enableHistoryOnName={false}
            hideDetailsActions
            groupByCity={groupByCity}
            groupByMarketLocation={groupByMarketLocation}
          />
        </>
      )}
    </div>
  );
}

function GroupOption({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={`Group retailer liabilities by ${label}`}
      onClick={onChange}
      className="inline-flex items-center gap-2 whitespace-nowrap"
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
          checked ? "border-blue-600" : "border-slate-400"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-blue-600" />}
      </span>
      <span>{label}</span>
    </button>
  );
}
