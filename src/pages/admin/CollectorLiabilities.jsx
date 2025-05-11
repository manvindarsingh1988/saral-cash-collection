import React, { useState } from "react";
import { apiBase } from "../../lib/apiBase";
import CollectorLedgerTable from "../../components/admin/CollectorLedgerTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function CollectorLiabilities() {
  useDocumentTitle("Collector Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectorLiabilities, setCollectorLiabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchCollectorLiabilities = async (date) => {
    try {
      setLoading(true);
      const collectorData = await apiBase.getLadgerInfosCreatedByCollectors(
        date
      );
      setCollectorLiabilities(collectorData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching collector ledgers:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search Filter */}
          <div className="rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
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
                onClick={() => fetchCollectorLiabilities(selectedDate)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 mt-2 sm:mt-0"
              >
                🔍 Search
              </button>
            </div>
          </div>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {collectorLiabilities.length > 0 && (
            <CollectorLedgerTable data={collectorLiabilities} />
          )}
        </div>
      </div>
    </div>
  );
}
