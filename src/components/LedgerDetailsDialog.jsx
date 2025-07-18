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

// Mapping of model types to their corresponding data fetchers
const fetchMap = {
  Retailer: (id) => apiBase.getLadgerInfoByRetailerid(false, id),
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchLadgerFn = fetchMap[modelFor];
        if (fetchLadgerFn) {
          const [ladger, master] = await Promise.all([
            fetchLadgerFn(userId),
            apiBase.getMasterData(),
          ]);
          setLadgerData(ladger || []);
          setMasterData(master || {});
        } else {
          console.warn(`No fetcher configured for modelFor: ${modelFor}`);
        }
      } catch (err) {
        console.error("Failed to fetch ladger info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
