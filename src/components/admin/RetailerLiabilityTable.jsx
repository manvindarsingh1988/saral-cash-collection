import React, { useState } from "react";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../LedgerDetailsDialog";

const columns = [
  { heading: "Retailer Id", key: "UserId", width: "60px" },
  { heading: "Retailer Name", key: "UserName", width: "120px" },
  { heading: "Counter Location", key: "CounterLocation", width: "80px" },
  { heading: "Remark", key: "Remark", width: "80px" },
  { heading: "Opening Amount", key: "ClosingAmount", width: "80px" },
  { heading: "Current Received Amount", key: "ReceivedAmount", width: "80px" },
  { heading: "Current Amount", key: "CurrentAmount", width: "80px" },
  { heading: "Projection Amount", key: "ProjectionAmount", width: "80px" },
  { heading: "Laibility Amount", key: "LaibilityAmount", width: "80px" },
  { heading: "Pending Approval Amount", key: "PendingApprovalAmount", width: "80px" },  
  { heading: "Rejection Amount", key: "RejectedAmount", width: "80px" },  
  { heading: "Action", key: "Action", width: "80px", isAction: true },
];

export default function RetailerLiabilityTable({ data }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

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
      // Toggle direction
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

    // Convert numeric strings to numbers
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

                          {/* Sorting Indicator */}
                          {sortConfig.key === col.key ? (
                            <span className="ml-1 text-gray-500">
                              {sortConfig.direction === "asc" ? "▲" : "▼"}
                            </span>
                          ) : (
                            <span className="ml-1 text-gray-400">⇅</span>
                          )}
                      </div>
                        <input
                          type="text"
                          placeholder="Filter"
                          value={filters[col.key] || ""}
                          onChange={(e) =>
                            onFilterChange(col.key, e.target.value)
                          }
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
                      className="px-4 py-2 whitespace-nowrap text-xs text-gray-900"
                    >
                      {col.isAction ? (
                        <button
                          onClick={() => onMoreDetails(item.UserId)}
                          className="text-blue-600 underline"
                        >
                          More Details
                        </button>
                      ) : col.key === "LaibilityAmount" ||
                        col.key === "PendingApprovalAmount" ||
                        col.key === "ProjectionAmount" ||
                        col.key === "RejectedAmount" ||
                        col.key === "ClosingAmount" ||
                        col.key === "CurrentAmount" ||
                        col.key === "ReceivedAmount"
                        ? (
                        `₹${formatIndianNumber(item[col.key])}`
                      ) : (
                        item[col.key]
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
    </div>
  );
}
