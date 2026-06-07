import React, { useState } from "react";
import { Eye, TrendingUp } from "lucide-react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../LedgerDetailsDialog";

function getColumns(showProjectionAmountBeforeXMinutes, showProjectionAmountWithoutCurrentSale) {
  const columns = [
    { heading: "Warning", key: "Warning", width: "100px" },
    { heading: "Retailer Name", key: "UserName", width: "120px" },
    { heading: "Remark", key: "Remark", width: "80px" },
    { heading: "Opening Amount", key: "ClosingAmount", width: "80px" },
    { heading: "Current Received Amount", key: "ReceivedAmount", width: "80px" },
    { heading: "Current Amount", key: "CurrentAmount", width: "80px" },
    { heading: "Projection Amount", key: "ProjectionAmount", width: "80px" },
    { heading: "Projection Without Current Sale", key: "ProjectionAmountWithoutCurrentSale", width: "100px" },
    { heading: "Laibility Amount", key: "LaibilityAmount", width: "80px" },
    { heading: "Pending Approval Amount", key: "PendingApprovalAmount", width: "80px" },
    { heading: "FixedFund Charge", key: "RejectedAmount", width: "80px" },
    { heading: "Action", key: "Action", width: "80px", isAction: true },
    { heading: "Counter Location", key: "CounterLocation", width: "80px" },
    { heading: "Linked Collector", key: "LinkedCollector", width: "80px" },
    { heading: "Linked Cashier", key: "LinkedCashier", width: "80px" },
    { heading: "Linked Master Cashier", key: "LinkedMasterCashier", width: "80px" },
  ];

  if (showProjectionAmountBeforeXMinutes) {
    columns.splice(7, 0, {
      heading: "Projection Amount Before X Minutes",
      key: "ProjectionAmountBeforeXMinutes",
      width: "100px",
    });
  }

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
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = data
    .filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      });
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      const isNumeric = !isNaN(Number(valA)) && !isNaN(Number(valB));
      if (isNumeric) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

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
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="overflow-x-auto">
        <div className="overflow-y-auto max-h-[600px] border border-gray-200 rounded text-xs">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.isAction ? (
                      col.heading
                    ) : (
                      <div className="flex flex-col">
                        <div
                          className="flex items-center cursor-pointer select-none"
                          onClick={() => onSort(col.key)}
                        >
                          <span>{col.heading}</span>
                          {sortConfig.key === col.key ? (
                            <span className="ml-1 text-gray-500">
                              {sortConfig.direction === "asc" ? "^" : "v"}
                            </span>
                          ) : (
                            <span className="ml-1 text-gray-400">+-</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={filters[col.key] || ""}
                          onChange={(e) => onFilterChange(col.key, e.target.value)}
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    )}
                  </th>
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
                        renderCellValue(item, col.key)
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
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group relative inline-flex h-7 w-7 flex-none items-center justify-center rounded border bg-white ${className}`}
    >
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] normal-case tracking-normal text-white shadow group-hover:block">
        {label}
      </span>
    </button>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded bg-white p-6 shadow">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          x
        </button>

        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Projection Amount
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-600">Retailer ID</label>
              <input
                value={retailer.UserId || ""}
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">
                Retailer Name
              </label>
              <input
                value={retailer.UserName || ""}
                readOnly
                className="mt-1 w-full rounded border bg-gray-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Date Time</label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAmount("");
                setError("");
              }}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Projection Amount
            </label>
            <input
              value={amount ? `Rs ${amount}` : ""}
              readOnly
              className="mt-1 w-full rounded border bg-gray-100 px-3 py-2 text-sm"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>
            <button
              onClick={fetchProjectionAmount}
              disabled={loading || !selectedDate}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Fetching..." : "Get Projection Amount"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



