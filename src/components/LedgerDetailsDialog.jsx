import React, { useEffect, useState } from "react";
import { apiBase } from "../lib/apiBase";

export default function LadgerDetailsDialog({ retailerId, date, onClose }) {
  const [ladgerData, setLadgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({});

  useEffect(() => {
    const fetchLadger = async () => {
      try {
        const [retailerData, masterData] = await Promise.all([
          await apiBase.getLadgerInfoByRetailerid(date, retailerId),
          apiBase.getMasterData(),
        ]);
        setLadgerData(retailerData || []);
        setMasterData(masterData || {});
      } catch (err) {
        console.error("Failed to fetch ladger info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLadger();
  }, [retailerId, date]);

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((x) => x.Id == id)?.Description || id;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 m-0 p-0"
      style={{ marginTop: "0px" }}
    >
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
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Collector</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Transaction Type</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Given On</th>
                  <th className="px-4 py-2 border">Comment</th>
                </tr>
              </thead>
              <tbody>
                {ladgerData.map((entry, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 border">{entry.Id}</td>
                    <td className="px-4 py-2 border">{entry.CollectorName}</td>
                    <td className="px-4 py-2 border">{entry.Amount}</td>
                    <td className="px-4 py-2 border">
                      {getMasterValue("TransactionTypes", entry.TransactionType)}
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.Date?.split("T")[0]}
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.GivenOn?.split("T")[0]}
                    </td>
                    <td className="px-4 py-2 border">{entry.Comment}</td>
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
