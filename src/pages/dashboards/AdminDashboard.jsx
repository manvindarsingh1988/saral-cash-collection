import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";

const retailerColumns = [
  { heading: "Retailer Name", key: "RetailUserName", width: "w-48" },
  { heading: "Amount", key: "Amt", width: "w-32" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "w-36" },
  { heading: "Status", key: "Status", width: "w-28" },
  { heading: "Action", key: "Action", width: "w-32", isAction: true },
];

const collectorColumns = [
  { heading: "Collector Name", key: "CollectorName", width: "w-48" },
  { heading: "Amount", key: "Amt", width: "w-32" },
  { heading: "Handover Amount", key: "HandoverAmt", width: "w-36" },
  { heading: "Status", key: "Status", width: "w-28" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [collectorLedgers, setCollectorLedgers] = useState([]);

  const [filters, setFilters] = useState({
    RetailUserName: "",
    Amt: "",
    HandoverAmt: "",
    Status: "",
  });
  const [summary, setSummary] = useState({
    totalAmt: 0,
    totalHandover: 0,
    totalTransactions: 0,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchLiabilities = async (date) => {
    try {
      setLoading(true);
      const [retailerData, collectorData] = await Promise.all([
        apiBase.getLiabilityAmountOfAllRetailers(date),
        apiBase.getLadgerInfosCreatedByCollectors(date),
      ]);

      setLiabilities(retailerData);
      setCollectorLedgers(collectorData);

      const totalAmt = retailerData.reduce(
        (sum, item) => sum + (item.Amt || 0),
        0
      );
      const totalHandover = retailerData.reduce(
        (sum, item) => sum + (item.HandoverAmt || 0),
        0
      );

      setSummary({
        totalAmt,
        totalHandover,
        totalTransactions: retailerData.length,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const filteredLiabilities = liabilities.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const handleMoreDetails = (retailUserId) => {
    setSelectedRetailer(retailUserId);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Retailer Liabilities
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 border-gray-300"
            />
            <button
              onClick={() => fetchLiabilities(selectedDate)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {liabilities?.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4 mb-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Liability Amount
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      ₹{formatIndianNumber(summary.totalAmt)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Handover Amount
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      ₹{formatIndianNumber(summary.totalHandover)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Transactions
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {summary.totalTransactions}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {retailerColumns.map((col) => (
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
                                placeholder="Filter..."
                                value={filters[col.key] || ""}
                                onChange={(e) =>
                                  handleFilterChange(col.key, e.target.value)
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
                    {filteredLiabilities.map((item) => (
                      <tr key={item.RetailUserId}>
                        {retailerColumns.map((col) => (
                          <td
                            key={col.key}
                            className={`px-4 py-4 whitespace-nowrap text-sm text-gray-900 ${col.width}`}
                          >
                            {col.isAction ? (
                              <button
                                onClick={() =>
                                  handleMoreDetails(item.RetailUserId)
                                }
                                className="text-blue-600 underline"
                              >
                                More Details
                              </button>
                            ) : col.key === "Amt" ||
                              col.key === "HandoverAmt" ? (
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

              {collectorLedgers.length > 0 && (
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6 mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Collector Ledger Info
                  </h3>
                  <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {collectorColumns.map((col) => (
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
                        {collectorLedgers.map((item, index) => (
                          <tr key={index}>
                            {collectorColumns.map((col) => (
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
              )}
            </>
          )}
        </div>
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
    </div>
  );
}
