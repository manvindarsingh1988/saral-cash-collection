import React, { useState } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function AdminDashboard() {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [summary, setSummary] = useState({
    totalAmt: 0,
    totalHandover: 0,
    totalClearedAmt: 0,
  });

  const fetchLiabilities = async (date) => {
    try {
      setLoading(true);
      const retailerData = await apiBase.getLiabilityAmountOfAllRetailers(date);

      setLiabilities(retailerData);

      const totalAmt = retailerData.reduce(
        (sum, item) => sum + (item.Amt || 0),
        0
      );
      const totalHandover = retailerData.reduce(
        (sum, item) => sum + (item.HandoverAmt || 0),
        0
      );
      const totalClearedAmt = retailerData.reduce(
        (sum, item) => sum + (item.ClearedAmt || 0),
        0
      );

      setSummary({
        totalAmt,
        totalHandover,
        totalClearedAmt: totalClearedAmt,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 sm:p-6">
          {/* Search Filter */}
          <div className="rounded-lg shadow-sm">
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
                onClick={() => fetchLiabilities(selectedDate)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 mt-2 sm:mt-0"
              >
                🔍 Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow p-6">Loading...</div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {liabilities.length > 0 && (
        <>
          <div className="rounded-lg">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4 mb-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Liability Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{formatIndianNumber(summary.totalAmt)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Handover Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{formatIndianNumber(summary.totalHandover)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clear Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  ₹{formatIndianNumber(summary.totalClearedAmt)}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <RetailerLiabilityTable
            data={liabilities}
            selectedDate={selectedDate}
          />
        </>
      )}
    </div>
  );
}
