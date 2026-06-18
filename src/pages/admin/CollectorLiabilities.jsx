import React, { useEffect, useState } from "react";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";
import Tooltip from "../../components/Tooltip";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";
import { formatIndianNumber } from "../../lib/utils";

const columns = [
  { key: "Warning", label: "Warning", width: "150px" },
  { key: "UserId", label: "ID", width: "110px" },
  { key: "UserName", label: "Name", width: "260px" },
  { key: "ClosingAmount", label: "Opening", width: "140px" },
  { key: "LaibilityAmount", label: "Liability (Rs)", width: "150px" },
  { key: "PendingApprovalAmount", label: "Pending (Rs)", width: "150px" },
  { key: "ProjectionAmount", label: "Projection (Rs)", width: "150px" },
  { key: "CurrentAmount", label: "Current", width: "130px" },
  { key: "RetailerInitiatedAmount", label: "Retailers Initiated Amount", width: "180px" },
  { key: "CollectorInitiatedAmount", label: "Collectors Initiated Amount", width: "180px" },
  { key: "LinkedCashier", label: "Linked Cashier", width: "200px" },
  { key: "LinkedMasterCashier", label: "Linked Master Cashier", width: "230px" },
];

const currencyText = (value) => `Rs ${formatIndianNumber(value || 0)}`;

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

export default function CollectorLiabilities({ userType, id }) {
  useDocumentTitle("Collector Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectorLiabilities, setCollectorLiabilities] = useState([]);
  const [modelFor, setModelFor] = useState("Handover");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
    totalRetailerInitiatedAmount: 0,
    totalCollectorInitiatedAmount: 0,
  });

  const [filters, setFilters] = useState({
    Warning: "",
    UserId: "",
    UserName: "",
    ClosingAmount: "",
    LaibilityAmount: "",
    PendingApprovalAmount: "",
    ProjectionAmount: "",
    CurrentAmount: "",
    RetailerInitiatedAmount: "",
    CollectorInitiatedAmount: "",
    LinkedCashier: "",
    LinkedMasterCashier: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchCollectorLiabilities();
  }, []);

  const fetchCollectorLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getCollectorLiabilities(id, userType);
      setCollectorLiabilities(data || []);

      setSummary({
        totalLaibilityAmount: data.reduce((acc, x) => acc + (x.LaibilityAmount || 0), 0),
        totalPendingApprovalAmount: data.reduce((acc, x) => acc + (x.PendingApprovalAmount || 0), 0),
        totalProjectionAmount: data.reduce((acc, x) => acc + (x.ProjectionAmount || 0), 0),
        totalRejectedAmount: data.reduce((acc, x) => acc + (x.RejectedAmount || 0), 0),
        totalCurrentAmount: data.reduce((acc, x) => acc + (x.CurrentAmount || 0), 0),
        totalClosingAmount: data.reduce((acc, x) => acc + (x.ClosingAmount || 0), 0),
        totalRetailerInitiatedAmount: data.reduce((acc, x) => acc + (x.RetailerInitiatedAmount || 0), 0),
        totalCollectorInitiatedAmount: data.reduce((acc, x) => acc + (x.CollectorInitiatedAmount || 0), 0),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const filteredData = sortTableRows(
    collectorLiabilities.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    ),
    sortConfig
  );

  const handleMoreDetails = (collectorId, model) => {
    setSelectedCollector(collectorId);
    setModelFor(model);
    setOpenDialog(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      {loading && <CenterLoader label="Loading collector liabilities..." />}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && collectorLiabilities.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="liability-summary grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {[
              { label: "Opening Amount", value: summary.totalClosingAmount },
              { label: "Liability Amount", value: summary.totalLaibilityAmount },
              { label: "Pending Approval", value: summary.totalPendingApprovalAmount },
              { label: "Projection Amount", value: summary.totalProjectionAmount },
              { label: "Current Amount", value: summary.totalCurrentAmount },
              { label: "Retailers Initiated Amount", value: summary.totalRetailerInitiatedAmount },
              { label: "Collectors Initiated Amount", value: summary.totalCollectorInitiatedAmount },
            ].map((item) => (
              <div key={item.label} className="metric-tile">
                <span className="metric-tile-label">{item.label}</span>
                <span className="metric-tile-value">{currencyText(item.value)}</span>
              </div>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="app-table-shell min-h-0 flex-1 overflow-auto">
              <table className="app-table min-w-full text-sm text-gray-700">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-2 text-left"
                        style={{ width: column.width, minWidth: column.width, maxWidth: column.width }}
                      >
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className={`flex items-center gap-1 text-left ${column.key === "Warning" ? "text-red-600" : ""}`}
                        >
                          <span>{column.label}</span>
                          <span className="text-[10px] text-slate-400">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-white">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-2">
                        <input
                          type="text"
                          placeholder={column.key}
                          className="w-full rounded border px-2 py-1 text-sm"
                          value={filters[column.key] || ""}
                          onChange={(e) => onFilterChange(column.key, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.UserId} className="border-t text-xs">
                      <td className="px-4 py-2">
                        <TruncatedCell className="text-red-600">{item.Warning || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.UserId}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.UserName || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.ClosingAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <Tooltip content={currencyText(item.LaibilityAmount)} className="block w-full">
                          <button
                            onClick={() => handleMoreDetails(item.UserId, "Cleared")}
                            className="w-full text-left text-blue-600 underline"
                          >
                            <TruncatedCell>{currencyText(item.LaibilityAmount)}</TruncatedCell>
                          </button>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2">
                        <Tooltip content={currencyText(item.PendingApprovalAmount)} className="block w-full">
                          <button
                            onClick={() => handleMoreDetails(item.UserId, "Handover")}
                            className="w-full text-left text-blue-600 underline"
                          >
                            <TruncatedCell>{currencyText(item.PendingApprovalAmount)}</TruncatedCell>
                          </button>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.ProjectionAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.CurrentAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.RetailerInitiatedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.CollectorInitiatedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.LinkedCashier || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.LinkedMasterCashier || "-"}</TruncatedCell>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {openDialog && (
        <LadgerDetailsDialog
          onClose={() => {
            setOpenDialog(false);
            setSelectedCollector(null);
          }}
          userId={selectedCollector}
          modelFor={modelFor}
        />
      )}
    </div>
  );
}
