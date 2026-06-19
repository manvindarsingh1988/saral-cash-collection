import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { apiBase } from "../lib/apiBase";
import TruncatedCell from "./TruncatedCell";

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

const fetchMap = {
  Retailer: (id, fromDate, toDate) =>
    apiBase.getLadgerInfoByRetailerid(true, id, fromDate, toDate),
  Collector: (id) => apiBase.getCollectorLiabilityDetails(id),
  Cleared: (id) => apiBase.getCollectorLiabilityDetails(id),
  Handover: (id) => apiBase.getCollectorLedgerDetails(id),
  CashierHandover: (id) => apiBase.getCashierLedgerDetails(id),
  CashierCleared: (id) => apiBase.getCashierLiabilityDetails(id),
};

export default function LadgerDetailsDialog({
  userId,
  onClose,
  modelFor = "Retailer",
}) {
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
          : await Promise.all([fetchFn(userId), apiBase.getMasterData()]);

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

  const modalContent = (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-lg relative">
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">Ledger Info</h2>
            <p className="app-modal-subtitle">View transaction history and details.</p>
          </div>
          <button onClick={onClose} className="app-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-6">
          {modelFor === "Retailer" && (
            <div className="mb-4 flex flex-wrap items-end gap-4">
              <div>
                <label className="app-modal-label block">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="app-modal-label block">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border px-3 py-2 rounded-lg"
                />
              </div>

              <button
                onClick={loadData}
                className="app-button-primary"
              >
                Search
              </button>
            </div>
          )}

          {error && <div className="mb-2 text-red-600">{error}</div>}

          {loading ? (
            <div>Loading...</div>
          ) : ladgerData.length === 0 ? (
            <div>No data available.</div>
          ) : (
            <div className="min-h-0 flex-1">
              <div className="app-table-shell h-full min-h-0 overflow-auto">
                <table className="app-table min-w-full text-sm text-left">
                  <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="border-b border-slate-200"
                          style={{
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                          }}
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
                            style={{
                              width: col.width,
                              minWidth: col.width,
                              maxWidth: col.width,
                            }}
                          >
                            <TruncatedCell>{getCellValue(entry, col.key)}</TruncatedCell>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
