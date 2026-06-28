import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Eye, TrendingUp, X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../LedgerDetailsDialog";
import TooltipIconButton from "../TooltipIconButton";
import TruncatedCell from "../TruncatedCell";

function getColumns(showProjectionAmountBeforeXMinutes, showProjectionAmountWithoutCurrentSale) {
  const columns = [
    { heading: "Retailer Name", key: "UserName", width: "240px" },
    { heading: "Opening Balance", key: "ClosingAmount", width: "140px" },
    { heading: "Current Sale", key: "CurrentAmount", width: "140px" },
    { heading: "Ewallet Pending Sale", key: "PendingAmount", width: "160px" },
    { heading: "Today Received Amount", key: "ReceivedAmount", width: "150px" },
    { heading: "Closing Amount", key: "ProjectionAmount", width: "140px" },
    { heading: "Hold Amount", key: "ProjectionAmountBeforeXMinutes", width: "140px" },
    { heading: "Pending Approval Amount", key: "PendingApprovalAmount", width: "160px" },
    { heading: "Laibility Amount", key: "LaibilityAmount", width: "140px" },
    { heading: "Projection Without Current Sale", key: "ProjectionAmountWithoutCurrentSale", width: "180px" },
    { heading: "FixedFund Charge", key: "RejectedAmount", width: "140px" },
    { heading: "Warning", key: "Warning", width: "140px" },    
    { heading: "Remark", key: "Remark", width: "140px" },
    { heading: "Action", key: "Action", width: "96px", isAction: true },
    { heading: "Counter Location", key: "CounterLocation", width: "180px" },
    { heading: "Linked Collector", key: "LinkedCollector", width: "180px" },
    { heading: "Linked Cashier", key: "LinkedCashier", width: "180px" },
    { heading: "Linked Master Cashier", key: "LinkedMasterCashier", width: "220px" },
  ];

  

  return columns;
}

export default function RetailerLiabilityTable({
  data,
  showProjectionAmountBeforeXMinutes = false,
  showProjectionAmountWithoutCurrentSale = false,
}) {
  const columns = getColumns(showProjectionAmountBeforeXMinutes, showProjectionAmountWithoutCurrentSale);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [projectionRetailer, setProjectionRetailer] = useState(null);

  const [filters, setFilters] = useState({
    UserName: "",
    Amt: "",
    HandoverAmt: "",
    CollectedAmt: "",
    Status: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const onSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = sortTableRows(
    data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      });
    }),
    sortConfig
  );

  const onMoreDetails = (retailUserId) => {
    setSelectedRetailer(retailUserId);
    setOpenDialog(true);
  };

  const onProjectionAmount = (retailer) => {
    setProjectionRetailer(retailer);
  };

  const renderCellValue = (item, key) => {
    const numericKeys = [
      "LaibilityAmount",
      "PendingAmount",
      "PendingApprovalAmount",
      "ProjectionAmount",
      "ProjectionAmountBeforeXMinutes",
      "RejectedAmount",
      "ClosingAmount",
      "CurrentAmount",
      "ReceivedAmount",
    ];

    const value = item[key];
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (numericKeys.includes(key)) {
      return `Rs ${formatIndianNumber(value)}`;
    }

    return value;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="app-table-shell h-full min-h-0 overflow-y-auto text-xs">
          <table className="app-table min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left"
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                  >
                    {col.isAction ? (
                      <span>{col.heading}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className={`flex items-center gap-1 text-left ${col.key === "Warning" ? "text-red-600" : ""}`}
                      >
                        <span>{col.heading}</span>
                        <span className="text-[10px] text-slate-400">
                          {sortConfig.key === col.key
                            ? sortConfig.direction === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
              <tr className="bg-white">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2"
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                  >
                    {col.isAction ? null : (
                      <input
                        type="text"
                        placeholder="Filter"
                        value={filters[col.key] || ""}
                        onChange={(e) => onFilterChange(col.key, e.target.value)}
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    )}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.UserId}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2 whitespace-nowrap text-xs ${
                        col.key === "Warning" ? "text-red-600" : "text-gray-900"
                      }`}
                      style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    >
                      {col.isAction ? (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <ActionIconButton
                            label="More Details"
                            onClick={() => onMoreDetails(item.UserId)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Eye size={16} />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Get Projection"
                            onClick={() => onProjectionAmount(item)}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <TrendingUp size={16} />
                          </ActionIconButton>
                        </div>
                      ) : (
                        <TruncatedCell className={col.key === "Warning" ? "text-red-600" : ""}>
                          {renderCellValue(item, col.key)}
                        </TruncatedCell>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openDialog && selectedRetailer && (
        <LadgerDetailsDialog
          userId={selectedRetailer}
          onClose={() => {
            setOpenDialog(false);
            setSelectedRetailer(null);
          }}
        />
      )}

      {projectionRetailer && (
        <ProjectionAmountDialog
          retailer={projectionRetailer}
          onClose={() => setProjectionRetailer(null)}
        />
      )}
    </div>
  );
}

function ActionIconButton({ label, onClick, className = "", children }) {
  return (
    <TooltipIconButton
      label={label}
      onClick={onClick}
      className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded border bg-white ${className}`}
    >
      {children}
    </TooltipIconButton>
  );
}

function ProjectionAmountDialog({ retailer, onClose }) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  const [selectedDate, setSelectedDate] = useState(
    now.toISOString().slice(0, 16)
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjectionAmount = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await apiBase.getProjectAmountByDate(
        retailer.UserId,
        selectedDate
      );
      setAmount(formatIndianNumber(result?.amount ?? result?.Amount ?? 0));
    } catch (err) {
      setError(err.message || "Failed to fetch projection amount.");
      setAmount("");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal app-modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">Projection Amount</h2>
            <p className="app-modal-subtitle">
              Check the projected amount for a selected retailer and time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body">
          <div className="app-modal-form">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="app-modal-field">
                <label className="app-modal-label">Retailer ID</label>
                <input
                  value={retailer.UserId || ""}
                  readOnly
                  className="w-full rounded-lg border bg-slate-100 px-3 py-2 text-sm"
                />
              </div>
              <div className="app-modal-field">
                <label className="app-modal-label">Retailer Name</label>
                <input
                  value={retailer.UserName || ""}
                  readOnly
                  className="w-full rounded-lg border bg-slate-100 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="app-modal-field">
              <label className="app-modal-label">Date Time</label>
              <input
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setAmount("");
                  setError("");
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="app-modal-field">
              <label className="app-modal-label">Projection Amount</label>
              <input
                value={amount ? `Rs ${amount}` : ""}
                readOnly
                className="w-full rounded-lg border bg-slate-100 px-3 py-2 text-sm"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </div>

        <div className="app-modal-actions">
          <button onClick={onClose} className="app-button-secondary">
            Cancel
          </button>
          <button
            onClick={fetchProjectionAmount}
            disabled={loading || !selectedDate}
            className="app-button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Get Projection Amount"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}



