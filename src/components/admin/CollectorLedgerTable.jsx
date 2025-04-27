import React, { useState } from "react";
import { formatIndianNumber } from "../../lib/utils";

const columns = [
  { heading: "Collector Name", key: "CollectorName", width: "w-48" },
  { heading: "Amount", key: "Amt", width: "w-32" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "w-36" },
  { heading: "Status", key: "Status", width: "w-28" },
];

export default function CollectorLedgerTable({ data }) {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredData = data.filter((item) =>
    columns.every((col) => {
      const filterValue = filters[col.key];
      if (!filterValue) return true;

      const cellValue = item[col.key]?.toString().toLowerCase() || "";
      return cellValue.includes(filterValue.toLowerCase());
    })
  );

  return (
    <div className="bg-white rounded-lg py-2 mt-2">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Collector Ledger Info
      </h3>
      <div className="overflow-x-auto max-h-[300px] border border-gray-200 rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width}`}
                >
                  {col.heading}
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((col) => (
                <th
                  key={`filter-${col.key}`}
                  className={`px-4 py-1 ${col.width}`}
                >
                  <input
                    type="text"
                    value={filters[col.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(col.key, e.target.value)
                    }
                    placeholder={`Filter ${col.heading}...`}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 whitespace-nowrap text-sm text-gray-900 ${col.width}`}
                  >
                    {col.key === "Amt" || col.key === "HandoverAmt"
                      ? `₹${formatIndianNumber(item[col.key])}`
                      : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
