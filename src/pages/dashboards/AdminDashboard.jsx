import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";
import RetailerLiabilityTable from "../../components/RetailerLiabilityTable";
import CollectorLedgerTable from "../../components/CollectorLedgerTable";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [collectorLedgers, setCollectorLedgers] = useState([]);

  const [summary, setSummary] = useState({
    totalAmt: 0,
    totalHandover: 0,
    totalTransactions: 0,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-lg">Search Data</label>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Retailer Liabilities
              </h3>
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
                      Total Transactions
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {summary.totalTransactions}
                    </dd>
                  </div>
                </div>
              </div>

              <RetailerLiabilityTable data={liabilities} />
              <CollectorLedgerTable data={collectorLedgers} />
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
