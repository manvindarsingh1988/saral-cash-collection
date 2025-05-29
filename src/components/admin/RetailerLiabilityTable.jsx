import React, { useState } from "react";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../LedgerDetailsDialog";

const columns = [
  { heading: "Retailer Id", key: "UserId", width: "200px" },
  { heading: "Retailer Name", key: "UserName", width: "200px" },
  { heading: "Laibility Amount", key: "LaibilityAmount", width: "80px" },
  {
    heading: "Pending Approval Amount",
    key: "PendingApprovalAmount",
    width: "80px",
  },
  { heading: "Projection Amount", key: "ProjectionAmount", width: "80px" },
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

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
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
                        <span>{col.heading}</span>
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
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
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
                        col.key === "RejectedAmount" ? (
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
