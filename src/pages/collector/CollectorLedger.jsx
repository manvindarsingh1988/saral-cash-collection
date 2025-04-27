import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase"; // adjust path if needed
import useDocumentTitle from "../../hooks/useDocumentTitle"; // optional if you want page title
import CollectorLedgerModal from "../../components/collector/CollectorLedgerModal";

export default function CollectorLedger({ collectorUserId }) {
  useDocumentTitle("Collector Ledger"); // optional
  const [selectedDate, setSelectedDate] = useState("");
  const [collectorLedgers, setCollectorLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [masterData, setMasterData] = useState(null);
  const [cashiers, setCashiers] = useState([]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [master, cashiers] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getCashiers(),
        ]);
        setMasterData(master);
        setCashiers(cashiers);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, []);

  const fetchCollectorLedgers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiBase.getLedgerInfoByCollectorId(
        selectedDate,
        collectorUserId
      );
      setCollectorLedgers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch collector ledgers");
    } finally {
      setLoading(false);
    }
  };

  const openAddLedger = () => {
    //setEditData(null);
    setModalOpen(true);
  };

  return (
    <div className="spacer-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-indigo-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={fetchCollectorLedgers}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            🔍 Search
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          onClick={openAddLedger}
          className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
        >
          Add Ledger Entry
        </button>
      </div>

      {/* Grid Section */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && collectorLedgers.length === 0 && (
          <div className="text-gray-600 text-center">
            No collector ledgers found
          </div>
        )}
        {!loading && collectorLedgers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retailer ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {/* Add more columns if needed */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectorLedgers.map((ledger, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {ledger.RetailerId}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      ₹{ledger.Amt}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {ledger.Date}
                    </td>
                    {/* Add more columns if needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CollectorLedgerModal
        collectorId={collectorUserId}
        masterData={masterData}
        cashiers={cashiers}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        modelFor="CollectorLedger"
      />
    </div>
  );
}
