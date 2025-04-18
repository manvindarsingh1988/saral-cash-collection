import React, { useState } from "react";
import { formatIndianNumber } from "../lib/utils";

const columns = [
  { heading: "Retailer Name", key: "RetailUserName", width: "w-48" },
  { heading: "Amount", key: "Amt", width: "w-32" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "w-36" },
  { heading: "Status", key: "Status", width: "w-28" },
  { heading: "Action", key: "Action", width: "w-32", isAction: true },
];

export default function RetailerLiabilityTable({ data }) {
  const [filters, setFilters] = useState({
    RetailUserName: "",
    Amt: "",
    HandoverAmt: "",
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
    <div className="overflow-x-auto max-h-[300px] border border-gray-200 rounded">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width}`}
              >
                {col.isAction ? (
                  col.heading
                ) : (
                  <div className="flex flex-col">
                    <span>{col.heading}</span>
                    <input
                      type="text"
                      placeholder={`Filter ${col.heading}...`}
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
            <tr key={item.RetailUserId}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-4 whitespace-nowrap text-sm text-gray-900 ${col.width}`}
                >
                  {col.isAction ? (
                    <button
                      onClick={() => onMoreDetails(item.RetailUserId)}
                      className="text-blue-600 underline"
                    >
                      More Details
                    </button>
                  ) : col.key === "Amt" || col.key === "HandoverAmt" ? (
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
  );
}
