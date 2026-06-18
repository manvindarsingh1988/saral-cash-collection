import React, { useEffect, useState } from "react";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";
import { formatIndianNumber } from "../../lib/utils";

const columns = [
  { key: "UserId", label: "ID", width: "110px" },
  { key: "UserName", label: "Name", width: "260px" },
  { key: "RetailerInitiatedAmount", label: "Retailer Initiated Amount (Rs)", width: "180px" },
  { key: "CollectorInitiatedAmount", label: "Collector Initiated Amount (Rs)", width: "180px" },
  { key: "CashierInitiatedAmount", label: "Cashier Initiated Amount (Rs)", width: "180px" },
  { key: "PendingApprovalAmount", label: "Pending Approval Amount (Rs)", width: "180px" },
  { key: "TodayRejectAmount", label: "Today Reject Amount (Rs)", width: "170px" },
  { key: "TodayApprovedAmount", label: "Today Approved Amount (Rs)", width: "180px" },
  { key: "StuckInBankAmount", label: "Stuck In Bank Amount (Rs)", width: "180px" },
  { key: "RetailerOpeningAmount", label: "Retailer Opening Amount", width: "170px" },
  { key: "RetailerCurrentSale", label: "Retailer Current Sale", width: "170px" },
  { key: "CollectorOpeningBalance", label: "Collector Opening Balance (Rs)", width: "180px" },
  { key: "CollectorCurrentSale", label: "Collector Current Sale (Rs)", width: "170px" },
  { key: "CasheirOpeningBalance", label: "Casheir Opening Balance (Rs)", width: "180px" },
  { key: "CashierCurrentSale", label: "Cashier Current Sale (Rs)", width: "170px" },
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

export default function MasterCashierLiabilities() {
  useDocumentTitle("Cashier Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashierLiabilities, setCashierLiabilities] = useState([]);

  const [summary, setSummary] = useState({
    totalRetailerInitiatedAmount: 0,
    totalCollectorInitiatedAmount: 0,
    totalCashierInitiatedAmount: 0,
    totalPendingApprovalAmount: 0,
    totalTodayRejectAmount: 0,
    totalTodayApprovedAmount: 0,
    totalStuckInBankAmount: 0,
  });

  const [filters, setFilters] = useState({
    UserId: "",
    UserName: "",
    RetailerInitiatedAmount: "",
    CollectorInitiatedAmount: "",
    CashierInitiatedAmount: "",
    PendingApprovalAmount: "",
    TodayRejectAmount: "",
    TodayApprovedAmount: "",
    StuckInBankAmount: "",
    RetailerOpeningAmount: "",
    RetailerCurrentSale: "",
    CollectorOpeningBalance: "",
    CollectorCurrentSale: "",
    CasheirOpeningBalance: "",
    CashierCurrentSale: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchMasterCashierLiabilities();
  }, []);

  const fetchMasterCashierLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getMasterCashierLiabilities();
      setCashierLiabilities(data || []);

      setSummary({
        totalRetailerInitiatedAmount: data.reduce((acc, x) => acc + (x.RetailerInitiatedAmount || 0), 0),
        totalCollectorInitiatedAmount: data.reduce((acc, x) => acc + (x.CollectorInitiatedAmount || 0), 0),
        totalCashierInitiatedAmount: data.reduce((acc, x) => acc + (x.CashierInitiatedAmount || 0), 0),
        totalPendingApprovalAmount: data.reduce((acc, x) => acc + (x.PendingApprovalAmount || 0), 0),
        totalTodayRejectAmount: data.reduce((acc, x) => acc + (x.TodayRejectAmount || 0), 0),
        totalTodayApprovedAmount: data.reduce((acc, x) => acc + (x.TodayApprovedAmount || 0), 0),
        totalStuckInBankAmount: data.reduce((acc, x) => acc + (x.StuckInBankAmount || 0), 0),
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
    cashierLiabilities.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    ),
    sortConfig
  );

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      {loading && <CenterLoader label="Loading master cashier liabilities..." />}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && cashierLiabilities.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="liability-summary grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {[
              { label: "Retailer Initiated Amount", value: summary.totalRetailerInitiatedAmount },
              { label: "Collector Initiated Amount", value: summary.totalCollectorInitiatedAmount },
              { label: "Cashier Initiated Amount", value: summary.totalCashierInitiatedAmount },
              { label: "Pending Approval Amount", value: summary.totalPendingApprovalAmount },
              { label: "Today Reject Amount", value: summary.totalTodayRejectAmount },
              { label: "Today Approved Amount", value: summary.totalTodayApprovedAmount },
              { label: "Stuck In Bank Amount/CDM", value: summary.totalStuckInBankAmount },
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
                          className="flex items-center gap-1 text-left"
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
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-2">
                          <TruncatedCell>
                            {column.key === "UserId" || column.key === "UserName"
                              ? item[column.key] || "-"
                              : currencyText(item[column.key])}
                          </TruncatedCell>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
