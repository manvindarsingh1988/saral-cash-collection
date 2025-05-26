import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatIndianNumber } from "../../lib/utils";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";

export default function CollectorLiabilities() {
  useDocumentTitle("Collector Liabilities");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectorLiabilities, setCollectorLiabilities] = useState([]);
  const [modelFor, setModelFor] = useState("Handover");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
  });

  const [filters, setFilters] = useState({
    UserId: "",
    UserName: "",
    LaibilityAmount: "",
    PendingApprovalAmount: "",
    ProjectionAmount: "",
    RejectedAmount: "",
  });

  useEffect(() => {
    fetchCollectorLiabilities();
  }, []);

  const fetchCollectorLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getCollectorLiabilities();
      setCollectorLiabilities(data || []);

      setSummary({
        totalLaibilityAmount: data.reduce((acc, x) => acc + (x.LaibilityAmount || 0), 0),
        totalPendingApprovalAmount: data.reduce((acc, x) => acc + (x.PendingApprovalAmount || 0), 0),
        totalProjectionAmount: data.reduce((acc, x) => acc + (x.ProjectionAmount || 0), 0),
        totalRejectedAmount: data.reduce((acc, x) => acc + (x.RejectedAmount || 0), 0),
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

  const filteredData = collectorLiabilities.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
    })
  );

  const handleMoreDetails = (collectorId, model) => {
    setSelectedCollector(collectorId);
    setModelFor(model);
    setOpenDialog(true);
  };

  return (
    <div className="p-4 space-y-4">
      {loading && <div className="text-center text-gray-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && collectorLiabilities.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Liability Amount", value: summary.totalLaibilityAmount },
              { label: "Pending Approval", value: summary.totalPendingApprovalAmount },
              { label: "Projection Amount", value: summary.totalProjectionAmount },
              { label: "Rejected Amount", value: summary.totalRejectedAmount },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg shadow p-4">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-lg font-bold text-gray-800 block">
                  ₹ {formatIndianNumber(item.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Liability (₹)</th>
                  <th className="px-4 py-2 text-left">Pending (₹)</th>
                  <th className="px-4 py-2 text-left">Rejected (₹)</th>
                  <th className="px-4 py-2 text-left">Projection (₹)</th>
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
                  <tr key={item.UserId} className="border-t">
                    <td className="px-4 py-2">{item.UserId}</td>
                    <td className="px-4 py-2">{item.UserName || "—"}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleMoreDetails(item.UserId, "Cleared")}
                        className="text-blue-600 underline"
                      >
                        ₹ {formatIndianNumber(item.LaibilityAmount)}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleMoreDetails(item.UserId, "Handover")}
                        className="text-blue-600 underline"
                      >
                        ₹ {formatIndianNumber(item.PendingApprovalAmount)}
                      </button>
                    </td>
                    <td className="px-4 py-2">₹ {formatIndianNumber(item.RejectedAmount)}</td>
                    <td className="px-4 py-2">₹ {formatIndianNumber(item.ProjectionAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Ledger Dialog */}
      {openDialog && (
        <LadgerDetailsDialog
          onClose={() => {
            setOpenDialog(false);
            setSelectedCollector(null);
          }}
          userId={selectedCollector}
          modelFor={modelFor}
        />
      )}
    </div>
  );
}
