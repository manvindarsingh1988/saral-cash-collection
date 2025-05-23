import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";

export default function CollectorLiabilities() {
  useDocumentTitle("Collector Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectorLiabilities, setCollectorLiabilities] = useState([]);
  const [modelFor, setModelFor] = useState("Handover");
  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
  });

  const [filters, setFilters] = useState({
    UserId: "",
    UserName: "",
    LaibilityAmount: "",
    PendingApprovalAmount: "",
    ProjectionAmount: "",
    RejectedAmount: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);

  const fetchCollectorLiabilities = async (date) => {
    try {
      setLoading(true);
      const collectorData = await apiBase.getCollectorLiabilities(date);
      setCollectorLiabilities(collectorData);
      setSummary({
        totalLaibilityAmount: collectorData.reduce(
          (acc, item) => acc + (item.LaibilityAmount || 0),
          0
        ),
        totalPendingApprovalAmount: collectorData.reduce(
          (acc, item) => acc + (item.PendingApprovalAmount || 0),
          0
        ),
        totalProjectionAmount: collectorData.reduce(
          (acc, item) => acc + (item.ProjectionAmount || 0),
          0
        ),
        totalRejectedAmount: collectorData.reduce(
          (acc, item) => acc + (item.RejectedAmount || 0),
          0
        ),
      });
      console.log("Summary Data:", summary);
    } catch (err) {
      console.error("Error fetching collector liabilities:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = collectorLiabilities.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    })
  );

  const handleMoreDetails = (collectorId, modelFor) => {
    setSelectedCollector(collectorId);
    setOpenDialog(true);
    setModelFor(modelFor);
  };

  useEffect(() => {
    fetchCollectorLiabilities();
  }, []);

  return (
    <>
      {loading && (
        <div className="bg-white rounded-lg shadow p-6">Loading...</div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {collectorLiabilities.length > 0 && !loading && (
        <>
          <div className="rounded-lg">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Liability Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalLaibilityAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalPendingApprovalAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projection Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalProjectionAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejection Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalRejectedAmount)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-y-auto overflow-x-hidden max-h-[400px] border border-gray-200 rounded text-xs">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Collector ID</span>
                        <input
                          type="text"
                          value={filters.UserId}
                          onChange={(e) =>
                            onFilterChange("CollectorId", e.target.value)
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Collector Name</span>
                        <input
                          type="text"
                          value={filters.UserName}
                          onChange={(e) =>
                            onFilterChange("UserName", e.target.value)
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Laibility Amount (₹)</span>
                        <input
                          type="text"
                          value={filters.LaibilityAmount}
                          onChange={(e) =>
                            onFilterChange("LaibilityAmount", e.target.value)
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Pending Approval Amount (₹)</span>
                        <input
                          type="text"
                          value={filters.PendingApprovalAmount}
                          onChange={(e) =>
                            onFilterChange(
                              "PendingApprovalAmount",
                              e.target.value
                            )
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Rejected Amount (₹)</span>
                        <input
                          type="text"
                          value={filters.RejectedAmount}
                          onChange={(e) =>
                            onFilterChange("RejectedAmount", e.target.value)
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col">
                        <span>Projection Amount (₹)</span>
                        <input
                          type="text"
                          value={filters.ProjectionAmount}
                          onChange={(e) =>
                            onFilterChange("ProjectionAmount", e.target.value)
                          }
                          placeholder="Filter"
                          className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.UserId}>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                        {item.UserId}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                        {item.UserName || "—"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-semibold">
                        <button
                          onClick={() =>
                            handleMoreDetails(item.UserId, "Cleared")
                          }
                          className="underline hover:text-indigo-800"
                        >
                          ₹ {formatIndianNumber(item.LaibilityAmount)}
                        </button>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-semibold">
                        <button
                          onClick={() =>
                            handleMoreDetails(item.UserId, "Handover")
                          }
                          className="underline hover:text-indigo-800"
                        >
                          ₹ {formatIndianNumber(item.PendingApprovalAmount)}
                        </button>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-semibold">
                        ₹ {formatIndianNumber(item.RejectedAmount)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 font-semibold">
                        ₹ {formatIndianNumber(item.ProjectionAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {openDialog && selectedCollector && (
        <LadgerDetailsDialog
          userId={selectedCollector}
          onClose={() => {
            setOpenDialog(false);
            setSelectedCollector(null);
          }}
          modelFor={modelFor}
        />
      )}
    </>
  );
}
