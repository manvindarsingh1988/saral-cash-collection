import React, { useEffect, useState } from "react";
import { apiBase } from "../lib/apiBase";

const columns = [
  { heading: "ID", key: "Id", width: "100px" },
  { heading: "Collector", key: "CollectorName", width: "150px" },
  { heading: "Amount", key: "Amount", width: "100px" },
  { heading: "Transaction Type", key: "TransactionType", width: "150px" },
  { heading: "WorkFlow", key: "WorkFlow", width: "150px" },
  { heading: "Date", key: "Date", width: "120px" },
  { heading: "Given On", key: "GivenOn", width: "120px" },
  { heading: "Comment", key: "Comment", width: "200px" },
  { heading: "Retailer", key: "RetailerName", width: "200px" },
  { heading: "Cashier", key: "CashierName", width: "200px" },
];

// fetchers
const fetchMap = {
  Retailer: (id, fromDate, toDate) =>
    apiBase.getLadgerInfoByRetailerid(true, id, fromDate, toDate),

  Collector: (id) => apiBase.getCollectorLiabilityDetails(id),
  Cleared: (id) => apiBase.getCollectorLiabilityDetails(id),
  Handover: (id) => apiBase.getCollectorLedgerDetails(id),
  CashierHandover: (id) => apiBase.getCashierLedgerDetails(id),
  CashierCleared: (id) => apiBase.getCashierLiabilityDetails(id),
};

export default function LadgerDetailsDialog({ userId, onClose, modelFor = "Retailer" }) {
  const [ladgerData, setLadgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({});

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);

      if (modelFor === "Retailer" && fromDate > toDate) {
        setError("From Date must be less than or equal to To Date");
        setLoading(false);
        return;
      }

      const fetchFn = fetchMap[modelFor];
      if (!fetchFn) return;

      const [ladger, master] =
        modelFor === "Retailer"
          ? await Promise.all([
              fetchFn(userId, fromDate, toDate),
              apiBase.getMasterData(),
            ])
          : await Promise.all([
              fetchFn(userId),
              apiBase.getMasterData(),
            ]);

      setLadgerData(ladger || []);
      setMasterData(master || {});
    } catch (err) {
      console.error("Failed to fetch ladger info", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, modelFor]);

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((x) => x.Id === id)?.Description || id;
  };

  const getCellValue = (entry, key) => {
    switch (key) {
      case "TransactionType":
        return getMasterValue("TransactionTypes", entry[key]);
      case "WorkFlow":
        return getMasterValue("WorkFlows", entry[key]);
      case "Date":
      case "GivenOn":
        return entry[key]?.split("T")[0] || "";
      default:
        return entry[key];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-5xl w-full max-h-[80vh] overflow-y-auto relative">
        <h2 className="text-xl font-semibold mb-4">Ledger Info</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Date filter only for Retailer */}
        {modelFor === "Retailer" && (
          <div className="flex gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="block text-sm">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>

            <button
              onClick={loadData}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Search
            </button>
          </div>
        )}

        {error && <div className="text-red-600 mb-2">{error}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : ladgerData.length === 0 ? (
          <div>No data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 border"
                      style={{ width: col.width }}
                    >
                      {col.heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ladgerData.map((entry, idx) => (
                  <tr key={idx} className="border-t">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 border"
                        style={{ width: col.width }}
                      >
                        {getCellValue(entry, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
