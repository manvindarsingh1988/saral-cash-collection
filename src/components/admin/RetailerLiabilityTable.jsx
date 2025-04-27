import React, { useState } from "react";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "./LedgerDetailsDialog";

const columns = [
  { heading: "Retailer Name", key: "RetailUserName", width: "200px" },
  { heading: "Amount", key: "Amt", width: "80px" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "80px" },
  { heading: "Clear Amount", key: "ClearAmt", width: "80px" },
  { heading: "Status", key: "Status", width: "80px" },
  { heading: "Action", key: "Action", width: "80px", isAction: true },
];

export default function RetailerLiabilityTable({ data, selectedDate }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const [filters, setFilters] = useState({
    RetailUserName: "",
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
    <>
      <div className="overflow-y-auto overflow-x-hidden max-h-[400px] border border-gray-200 rounded">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.isAction ? (
                    col.heading
                  ) : (
                    <div className="flex flex-col">
                      <span>{col.heading}</span>
                      <input
                        type="text"
                        style={{ width: col.width }}
                        placeholder={`Filter`}
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
              <tr key={item.RetailUserId}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ width: col.width }}
                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col.isAction ? (
                      <button
                        onClick={() => onMoreDetails(item.RetailUserId)}
                        className="text-blue-600 underline"
                      >
                        More Details
                      </button>
                    ) : col.key === "Amt" ||
                      col.key === "HandoverAmt" ||
                      col.key === "ClearAmt" ? (
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

      {openDialog && selectedRetailer && (
        <LadgerDetailsDialog
          retailerId={selectedRetailer}
          date={selectedDate}
          onClose={() => {
            setOpenDialog(false);
            setSelectedRetailer(null);
          }}
        />
      )}
    </>
  );
}
