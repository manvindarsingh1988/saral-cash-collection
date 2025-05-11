import React, { useState, useEffect, use } from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";

const columns = [
  { heading: "ID", accessor: "Id", width: "100px" },
  { heading: "Amount (₹)", accessor: "Amount", width: "130px" },
  { heading: "Retailer Name", accessor: "RetailerName", width: "200px" },
  { heading: "Cashier Name", accessor: "CashierName", width: "180px" },
  { heading: "Collector Name", accessor: "CollectorName", width: "120px" },
  { heading: "Transaction Type", accessor: "TransactionType", width: "120px" },
  { heading: "Workflow", accessor: "WorkFlow", width: "120px" },
  { heading: "Date", accessor: "Date", width: "130px" },
  { heading: "Given On", accessor: "GivenOn", width: "130px" },
  { heading: "Comment", accessor: "Comment", width: "100px" },
];

export default function PendingApprovals() {
  useDocumentTitle("Pending Approvals");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  new Date().toISOString().split("T")[0];

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Date Filter */}
          {/* <div className="rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => fetchPendingApprovals(selectedDate)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 mt-2 sm:mt-0"
              >
                🔍 Search
              </button>
            </div>
          </div> */}

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
                      <tr key={idx}>
                        {columns.map((col) => {
                          if (col.accessor === "TransactionType") {
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
    </div>
  );
}
