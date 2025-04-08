import React, { useState, useEffect } from "react";
import { mockApi } from "../../lib/mockApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [filters, setFilters] = useState({
    RetailUserName: "",
    Amt: "",
    HandoverAmt: "",
    Status: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await mockApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiabilities = async (date) => {
    try {
      const data = await mockApi.getLiabilityAmountOfAllRetailers(date);
      setLiabilities(data);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    try {
      await mockApi.updateTransactionStatus(transactionId, newStatus);
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (items) => {
    return items.filter((item) => {
      console.log("Filters:", filters);
      console.log("Item:", item);
      console.log("RetailUserName:", item.RetailUserName);
      console.log("Amt:", item.Amt);
      console.log("HandoverAmt:", item.HandoverAmt);
      console.log("Status:", item.Status);
      console.log("Filter RetailUserName:", filters.RetailUserName);
      console.log("Filter Amt:", filters.Amt);
      console.log("Filter HandoverAmt:", filters.HandoverAmt);
      console.log("Filter Status:", filters.Status);
      return (
        item.RetailUserName?.toLowerCase().includes(
          filters.RetailUserName?.toLowerCase()
        ) &&
        item.Amt.toString().includes(filters.Amt) &&
        item.HandoverAmt.toString().includes(filters.HandoverAmt) &&
        item.Status?.toLowerCase().includes(filters.Status?.toLowerCase())
      );
    });
  };

  const filteredLiabilities = liabilities.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Ignore empty filters
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false; // Ignore nulls
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: "Total Amount", value: stats.totalAmount },
          { label: "Pending Amount", value: stats.pendingAmount },
          { label: "Total Transactions", value: stats.totalTransactions },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                {item.label}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {item.label.includes("Amount") ? `₹${item.value}` : item.value}
              </dd>
            </div>
          </div>
        ))}
      </div>

      {/* Liabilities */}
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

          {selectedDate && (
            <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {["RetailUserName", "Amt", "HandoverAmt", "Status"].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex flex-col">
                            <span>{col}</span>
                            <input
                              type="text"
                              placeholder="Filter..."
                              value={filters[col]}
                              onChange={(e) =>
                                handleFilterChange(col, e.target.value)
                              }
                              className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLiabilities.map((item) => (
                    <tr key={item.RetailUserId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.RetailUserName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.Amt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.HandoverAmt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.Status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
