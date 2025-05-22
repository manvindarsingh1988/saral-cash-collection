import React, { useState } from "react";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../LedgerDetailsDialog";

const columns = [
  { heading: "Retailer Name", key: "UserName", width: "200px" },
  { heading: "Amount", key: "Amt", width: "80px" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "80px" },
  { heading: "Clear Amount", key: "ClearedAmt", width: "80px" },
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="overflow-y-auto overflow-x-hidden max-h-[400px] border border-gray-200 rounded text-xs">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr key={"header"}>
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
                        // style={{ width: col.width }}
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
              <tr key={item.UserId}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ width: col.width }}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col.isAction ? (
                      <button
                        onClick={() => onMoreDetails(item.UserId)}
                        className="text-blue-600 underline"
                      >
                        More Details
                      </button>
                    ) : col.key === "Amt" ||
                      col.key === "HandoverAmt" ||
                      col.key === "ClearedAmt" ? (
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
