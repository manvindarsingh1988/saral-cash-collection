import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";

export default function CashierLiabilities({ userType, id }) {
  useDocumentTitle("Cashier Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashierLiabilities, setCashierLiabilities] = useState([]);
  const [modelFor, setModelFor] = useState("CashierHandover");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState(null);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
    totalRetailerInitiatedAmount: 0,
  });

  const [filters, setFilters] = useState({
    Warning: "",
    UserId: "",
    UserName: "",
    LaibilityAmount: "",
    PendingApprovalAmount: "",
    ProjectionAmount: "",
    RejectedAmount: "",
    CurrentAmount: "",
    ClosingAmount: "",
    RetailerInitiatedAmount: "",
  });

  useEffect(() => {
    fetchCashierLiabilities();
  }, []);

  const fetchCashierLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getCashierLiabilities(id, userType);
      setCashierLiabilities(data || []);

      setSummary({
        totalLaibilityAmount: data.reduce(
          (acc, x) => acc + (x.LaibilityAmount || 0),
          0
        ),
        totalPendingApprovalAmount: data.reduce(
          (acc, x) => acc + (x.PendingApprovalAmount || 0),
          0
        ),
        totalProjectionAmount: data.reduce(
          (acc, x) => acc + (x.ProjectionAmount || 0),
          0
        ),
        totalRejectedAmount: data.reduce(
          (acc, x) => acc + (x.RejectedAmount || 0),
          0
        ),
        totalCurrentAmount: data.reduce(
          (acc, x) => acc + (x.CurrentAmount || 0),
          0
        ),
        totalClosingAmount: data.reduce(
          (acc, x) => acc + (x.ClosingAmount || 0),
          0
        ),
        totalRetailerInitiatedAmount: data.reduce(
          (acc, x) => acc + (x.RetailerInitiatedAmount || 0),
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

  const handleMoreDetails = (cashierId, model) => {
    setSelectedCashier(cashierId);
    setModelFor(model);
    setOpenDialog(true);
  };

  return (
    <div className="p-4 space-y-4">
      {loading && <div className="text-center text-gray-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && cashierLiabilities.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-4">
            
            {[
              { label: "Opening Amount", value: summary.totalClosingAmount },
              {
                label: "Liability Amount",
                value: summary.totalLaibilityAmount,
              },
              {
                label: "Pending Approval",
                value: summary.totalPendingApprovalAmount,
              },
              {
                label: "Projection Amount",
                value: summary.totalProjectionAmount,
              },
              { label: "Current Amount", value: summary.totalCurrentAmount },
              
              {
                label: "Collectors Initiated Amount",
                value: summary.totalRetailerInitiatedAmount,
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
                    <th className="px-4 py-2 text-left">Warning</th>                  
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Opening</th>
                    <th className="px-4 py-2 text-left">Liability (₹)</th>
                    <th className="px-4 py-2 text-left">Pending (₹)</th>
                    <th className="px-4 py-2 text-left">Projection (₹)</th>
                    <th className="px-4 py-2 text-left">Current</th>                    
                    <th className="px-4 py-2 text-left">
                      Collectors Initiated Amount
                    </th>
                    <th className="px-4 py-2 text-left">
                      Linked Master Cashier
                    </th>
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
                      <td className="px-4 py-2 text-red-600">{item.Warning}</td>
                      <td className="px-4 py-2">{item.UserId}</td>
                      <td className="px-4 py-2">{item.UserName || "—"}</td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.ClosingAmount)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            handleMoreDetails(item.UserId, "CashierCleared")
                          }
                          className="text-blue-600 underline"
                        >
                          ₹ {formatIndianNumber(item.LaibilityAmount)}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            handleMoreDetails(item.UserId, "CashierHandover")
                          }
                          className="text-blue-600 underline"
                        >
                          ₹ {formatIndianNumber(item.PendingApprovalAmount)}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.ProjectionAmount)}
                      </td>
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.CurrentAmount)}
                      </td>                      
                      <td className="px-4 py-2">
                        ₹ {formatIndianNumber(item.RetailerInitiatedAmount)}
                      </td>
                      <td className="px-4 py-2">{item.LinkedMasterCashier || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Ledger Dialog */}
      {openDialog && (
        <LadgerDetailsDialog
          onClose={() => {
            setOpenDialog(false);
            setSelectedCashier(null);
          }}
          userId={selectedCashier}
          modelFor={modelFor}
        />
      )}
    </div>
  );
}
