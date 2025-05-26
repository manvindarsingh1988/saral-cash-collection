import React, { useState, useEffect } from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import ApprovalLedgerModal from "../../components/admin/ApprovalLedgerModal";
import { formatToCustomDateTime } from "../../lib/utils";

const columns = [
  { heading: "ID", accessor: "Id" },
  { heading: "Amount (₹)", accessor: "Amount" },
  { heading: "Cashier Name", accessor: "CashierName" },
  { heading: "Collector Name", accessor: "CollectorName" },
  { heading: "Retailer Name", accessor: "RetailerName" },
  { heading: "Transaction Type", accessor: "TransactionType" },
  { heading: "Workflow", accessor: "WorkFlow" },
  { heading: "Date", accessor: "Date" },
  { heading: "Given On", accessor: "GivenOn" },
  { heading: "Comment", accessor: "Comment" },
];

export default function PendingApprovals() {
  useDocumentTitle("Pending Approvals");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [filters, setFilters] = useState({});
  const [masterData, setMasterData] = useState({});

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const [master, approvals] = await Promise.all([
        apiBase.getMasterData(),
        apiBase.getPendingApprovals(),
      ]);
      setMasterData(master || {});
      setPendingApprovals(approvals);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getMasterValue = (type, id) => {
    return masterData?.[type]?.find((x) => x.Id == id)?.Description || id;
  };

  const handleFilterChange = (accessor, value) => {
    setFilters((prev) => ({ ...prev, [accessor]: value }));
  };

  const filteredData = pendingApprovals.filter((item) =>
    columns.every(({ accessor }) => {
      const filter = filters[accessor];
      if (!filter) return true;
      const value = String(item[accessor] ?? "").toLowerCase();
      return value.includes(filter.toLowerCase());
    })
  );

  const renderCell = (item, accessor) => {
    const value = item[accessor];
    if (accessor === "Amount") return `₹ ${Number(value).toFixed(2)}`;
    if (accessor === "Date" || accessor === "GivenOn")
      return formatToCustomDateTime(value) || "—";
    return value || "—";
  };

  const openLedger = (data) => {
    if (!data || data.WorkFlow === "5" || data.WorkFlow === "3") return;
    setEditData(data);
    setModalOpen(true);
  };

  const handleLedgerSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date().toISOString(),
        CollectorId: data.TransactionType === "2" ? "" : data.CollectorId,
        CollectorName: data.TransactionType === "2" ? "" : data.CollectorName,
        CashierId: apiBase.getCurrentUser()?.Id,
        CashierName: apiBase.getCurrentUser()?.UserName,
        RetailerId: data.RetailerId,
      };
      await apiBase.updateLedgerInfo(payload);
      await fetchPendingApprovals();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 sm:p-6">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="px-4 py-2 text-left font-medium text-gray-700 uppercase text-xs"
                    >
                      {col.heading}
                    </th>
                  ))}
                </tr>
                <tr>
                  {columns.map((col) => (
                    <th key={col.accessor} className="px-4 py-1 text-left">
                      {["TransactionType", "WorkFlow"].includes(col.accessor) &&
                      masterData ? (
                        <select
                          value={filters[col.accessor] || ""}
                          onChange={(e) =>
                            handleFilterChange(col.accessor, e.target.value)
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="">All</option>
                          {masterData[col.accessor + "s"]?.map((opt) => (
                            <option key={opt.Id} value={opt.Id}>
                              {opt.Description}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Filter..."
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                          value={filters[col.accessor] || ""}
                          onChange={(e) =>
                            handleFilterChange(col.accessor, e.target.value)
                          }
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 cursor-pointer">
                      {columns.map((col) => {
                        const val = col.accessor;
                        if (val === "Id") {
                          return (
                            <td key={val} className="px-4 py-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  openLedger(item);
                                }}
                                className="text-indigo-600 underline hover:text-indigo-800"
                              >
                                {item[val]}
                              </button>
                            </td>
                          );
                        } else if (val === "TransactionType") {
                          return (
                            <td key={val} className="px-4 py-2">
                              {getMasterValue(
                                "TransactionTypes",
                                item.TransactionType
                              )}
                            </td>
                          );
                        } else if (val === "WorkFlow") {
                          return (
                            <td key={val} className="px-4 py-2">
                              {getMasterValue("WorkFlows", item.WorkFlow)}
                            </td>
                          );
                        } else {
                          return (
                            <td key={val} className="px-4 py-2">
                              {renderCell(item, val)}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-4 text-gray-500"
                    >
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ApprovalLedgerModal
          masterData={masterData}
          initialData={editData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleLedgerSubmit}
        />
      )}
    </div>
  );
}
