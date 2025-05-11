import React, { useState, useEffect, use } from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import ApprovalLedgerModal from "../../components/admin/ApprovalLedgerModal";

const columns = [
  { heading: "ID", accessor: "Id", width: "30px" },
  { heading: "Amount (₹)", accessor: "Amount", width: "80px" },
  // { heading: "Retailer Name", accessor: "RetailerName", width: "150px" },
  { heading: "Cashier Name", accessor: "CashierName", width: "150px" },
  { heading: "Collector Name", accessor: "CollectorName", width: "100px" },
  { heading: "Transaction Type", accessor: "TransactionType", width: "50px" },
  { heading: "Workflow", accessor: "WorkFlow", width: "70px" },
  { heading: "Date", accessor: "Date", width: "100px" },
  { heading: "Given On", accessor: "GivenOn", width: "100px" },
  { heading: "Comment", accessor: "Comment", width: "80px" },
];

export default function PendingApprovals() {
  useDocumentTitle("Pending Approvals");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  new Date().toISOString().split("T")[0];
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [filters, setFilters] = useState({});
  const [masterData, setMasterData] = useState({});

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async (date) => {
    try {
      setLoading(true);
      const [masterData, approvals] = await Promise.all([
        apiBase.getMasterData(),
        apiBase.getPendingApprovals(date),
      ]);

      setPendingApprovals(approvals);
      setMasterData(masterData || {});
      setLoading(false);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((x) => x.Id == id)?.Description || id;
  };

  const handleFilterChange = (accessor, value) => {
    setFilters((prev) => ({ ...prev, [accessor]: value }));
  };

  const filteredData = pendingApprovals.filter((item) =>
    columns.every(({ accessor }) => {
      const filterValue = filters[accessor];
      if (!filterValue) return true;
      const itemValue = String(item[accessor] ?? "").toLowerCase();
      return itemValue.includes(filterValue.toLowerCase());
    })
  );

  const renderCell = (item, accessor) => {
    const value = item[accessor];
    if (accessor === "Amount") {
      return `₹ ${Number(value).toFixed(2)}`;
    }
    if (accessor === "Date" || accessor === "GivenOn") {
      return value?.split("T")[0] || "—";
    }
    return value || "—";
  };

  const openLedger = (data) => {
    if (!data || data.WorkFlow == "5" || data.WorkFlow == "3") return;

    setEditData(data);
    setModalOpen(true);
  };

  const handleLedgerSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: data.Workflow,
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date().toISOString(),
        CollectorId: data.TransactionType == "2" ? "" : data.CollectorId,
        CollectorName: data.TransactionType == "2" ? "" : data.CollectorName,
        CashierId: apiBase.getCurrentUser()?.Id,
        CashierName: apiBase.getCurrentUser()?.UserName,
      };

      await apiBase.updateLedgerInfo(payload);
      await fetchData(selectedDate);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {pendingApprovals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y border border-gray-200 rounded-lg text-xs">
                <thead className="">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.accessor}
                        style={{ width: col.width }}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.heading}
                      </th>
                    ))}
                  </tr>
                  <tr className="">
                    {columns.map((col) => (
                      <th
                        key={col.accessor}
                        style={{ width: col.width }}
                        className="px-4 py-1"
                      >
                        {["TransactionType", "WorkFlow"].includes(
                          col.accessor
                        ) && masterData ? (
                          <select
                            value={filters[col.accessor]}
                            onChange={(e) =>
                              handleFilterChange(col.accessor, e.target.value)
                            }
                            className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
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
                            style={{ width: col.width }}
                            className="w-full px-2 py-1 border border-indigo-200 rounded-md"
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={(e) => {
                          e.preventDefault();
                          openLedger(item);
                        }}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        {columns.map((col) => {
                          if (col.accessor === "Id") {
                            return (
                              <td
                                key={col.accessor}
                                className="px-4 py-2 text-sm text-gray-900"
                                style={{ width: col.width }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openLedger(item);
                                  }}
                                  className="underline hover:text-indigo-800"
                                >
                                  {item[col.accessor]}
                                </button>
                              </td>
                            );
                          } else if (col.accessor === "TransactionType") {
                            return (
                              <td
                                key={col.accessor}
                                className="px-4 py-2 text-sm text-gray-900"
                                style={{ width: col.width }}
                              >
                                {getMasterValue(
                                  "TransactionTypes",
                                  item.TransactionType
                                )}
                              </td>
                            );
                          } else if (col.accessor === "WorkFlow") {
                            return (
                              <td
                                key={col.accessor}
                                className="px-4 py-2 text-gray-900"
                                style={{ width: col.width }}
                              >
                                {getMasterValue("WorkFlows", item.WorkFlow)}
                              </td>
                            );
                          } else {
                            {
                              getMasterValue(
                                "TransactionTypes",
                                item.TransactionType
                              );
                            }
                            return (
                              <td
                                key={col.accessor}
                                className="px-4 py-2 text-gray-900"
                                style={{ width: col.width }}
                              >
                                {renderCell(item, col.accessor)}
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
          )}
        </div>
      </div>
      {isModalOpen && (
        <ApprovalLedgerModal
          masterData={masterData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleLedgerSubmit}
          initialData={editData}
        />
      )}
    </div>
  );
}
