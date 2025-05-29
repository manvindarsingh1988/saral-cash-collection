import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function AdminDashboard() {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
  });

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      setLoading(true);
      const retailerData = await apiBase.getLiabilityAmountOfAllRetailers();

      setLiabilities(retailerData);

      const totalLaibilityAmount = retailerData.reduce(
        (sum, item) => sum + (item.LaibilityAmount || 0),
        0
      );
      const totalPendingApprovalAmount = retailerData.reduce(
        (sum, item) => sum + (item.PendingApprovalAmount || 0),
        0
      );
      const totalProjectionAmount = retailerData.reduce(
        (sum, item) => sum + (item.ProjectionAmount || 0),
        0
      );
      const totalRejectedAmount = retailerData.reduce(
        (sum, item) => sum + (item.RejectedAmount || 0),
        0
      );
      const totalCurrentAmount = retailerData.reduce(
        (sum, item) => sum + (item.CurrentAmount || 0),
        0
      );
      const totalClosingAmount = retailerData.reduce(
        (sum, item) => sum + (item.ClosingAmount || 0),
        0
      );

      setSummary({
        totalLaibilityAmount,
        totalPendingApprovalAmount,
        totalProjectionAmount,
        totalRejectedAmount,
        totalCurrentAmount,
        totalClosingAmount
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  return (
    <div className="">
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 mt-2">Loading...</div>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {liabilities.length > 0 && (
        <>
          <div className="rounded-lg py-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-6 mb-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Liability Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalLaibilityAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approval Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalPendingApprovalAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projection Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalProjectionAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rejection Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalRejectedAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalCurrentAmount)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-3">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Closing Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(summary.totalClosingAmount)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <RetailerLiabilityTable data={liabilities} />
        </>
      )}
    </div>
  );
}
