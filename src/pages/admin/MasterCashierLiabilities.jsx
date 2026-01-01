import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";

export default function MasterCashierLiabilities({ userType, id }) {
  useDocumentTitle("Cashier Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashierLiabilities, setCashierLiabilities] = useState([]);

  const [summary, setSummary] = useState({
    totalRetailerInitiatedAmount: 0,
    totalCollectorInitiatedAmount: 0,
    totalCashierInitiatedAmount: 0,
    totalPendingApprovalAmount: 0,
    totalTodayRejectAmount: 0,
    totalTodayApprovedAmount: 0,
    totalStuckInBankAmount: 0,
  });

  const [filters, setFilters] = useState({
    UserId: "",
    UserName: "",
    RetailerInitiatedAmount: "",
    CollectorInitiatedAmount: "",
    CashierInitiatedAmount: "",
    PendingApprovalAmount: "",
    TodayRejectAmount: "",
    TodayApprovedAmount: "",
    StuckInBankAmount: "",
  });

  useEffect(() => {
    fetchMasterCashierLiabilities();
  }, []);

  const fetchMasterCashierLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getMasterCashierLiabilities();
      setCashierLiabilities(data || []);

      setSummary({
        totalRetailerInitiatedAmount: data.reduce(
          (acc, x) => acc + (x.RetailerInitiatedAmount || 0),
          0
        ),
        totalCollectorInitiatedAmount: data.reduce(
          (acc, x) => acc + (x.CollectorInitiatedAmount || 0),
          0
        ),
        totalCashierInitiatedAmount: data.reduce(
          (acc, x) => acc + (x.CashierInitiatedAmount || 0),
          0
        ),
        totalPendingApprovalAmount: data.reduce(
          (acc, x) => acc + (x.PendingApprovalAmount || 0),
          0
        ),
        totalTodayRejectAmount: data.reduce(
          (acc, x) => acc + (x.TodayRejectAmount || 0),
          0
        ),
        totalTodayApprovedAmount: data.reduce(
          (acc, x) => acc + (x.TodayApprovedAmount || 0),
          0
        ),
        StuckInBankAmount: data.reduce(
          (acc, x) => acc + (x.StuckInBankAmount || 0),
          0
        ),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredData = cashierLiabilities.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
    })
  );

  return (
    <div className="p-4 space-y-4">
      {loading && <div className="text-center text-gray-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && cashierLiabilities.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 mb-4">
            
            {[
              { 
                label: "Retailer Initiated Amount", 
                value: summary.totalRetailerInitiatedAmount },
              {
                label: "Collector Initiated Amount",
                value: summary.totalCollectorInitiatedAmount,
              },
              {
                label: "Cashier Initiated Amount",
                value: summary.totalCashierInitiatedAmount,
              },
              {
                label: "Pending Approval Amount",
                value: summary.totalPendingApprovalAmount,
              },
              { 
                label: "Today Reject Amount", 
                value: summary.totalTodayRejectAmount
             },
              { 
                label: "Today Approved Amount", 
                value: summary.totalTodayApprovedAmount },
              
              {
                label: "Stuck In Bank Amount/CDM",
                value: summary.totalStuckInBankAmount,
              },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg shadow p-4">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-lg font-bold text-gray-800 block">
                  ₹ {formatIndianNumber(item.value)}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>                    
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Retailer Initiated Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Collector Initiated Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Cashier Initiated Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Pending Approval Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Today Reject Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Today Approved Amount (₹)</th>                    
                    <th className="px-4 py-2 text-left">Stuck In Bank Amount (₹)</th>
                    <th className="px-4 py-2 text-left">Retailer Opening Amount</th>
                    <th className="px-4 py-2 text-left">Retailer Current Sale</th>
                    <th className="px-4 py-2 text-left">Collector Opening Balance (₹)</th>
                    <th className="px-4 py-2 text-left">Collector Current Sale (₹)</th>
                    <th className="px-4 py-2 text-left">Casheir Opening Balance (₹)</th>
                    <th className="px-4 py-2 text-left">Cashier Current Sale (₹)</th>
                  </tr>
                  <tr className="bg-white">
                    {Object.entries(filters).map(([key, value]) => (
                      <td key={key} className="px-4 py-2">
                        <input
                          type="text"
                          placeholder={key}
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={value}
                          onChange={(e) => onFilterChange(key, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.UserId} className="border-t text-xs">
                      <td className="px-4 py-2">{item.UserId}</td>
                      <td className="px-4 py-2">{item.UserName || "—"}</td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.RetailerInitiatedAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CollectorInitiatedAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CashierInitiatedAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.PendingApprovalAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.TodayRejectAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.TodayApprovedAmount)}
                      </td>                      
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.StuckInBankAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.RetailerOpeningAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.RetailerCurrentSale)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CollectorOpeningBalance)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CollectorCurrentSale)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CasheirOpeningBalance)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CashierCurrentSale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
