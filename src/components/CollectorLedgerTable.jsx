import React from "react";
import { formatIndianNumber } from "../lib/utils";

export default function CollectorLedgerTable({ columns, data }) {
  return (
    <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.width}`}
              >
                {col.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
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
  );
}
