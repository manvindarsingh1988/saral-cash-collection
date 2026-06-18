import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import ApprovalLedgerModal from "../../components/admin/ApprovalLedgerModal";
import Tooltip from "../../components/Tooltip";
import TooltipIconButton from "../../components/TooltipIconButton";
import TruncatedCell from "../../components/TruncatedCell";
import { useCollectorApprovalGate } from "../../components/collector/CollectorApprovalGateContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";
import {
  formatToCustomDateTime,
  handleDownloadFile,
} from "../../lib/utils";

const getWorkflowRowStyle = (workFlow) => {
  if (workFlow === 1) return { backgroundColor: "#dbeafe" };
  if (workFlow === 2 || workFlow === 4) return { backgroundColor: "#fee2e2" };
  if (workFlow === 5 || workFlow === 3) return { backgroundColor: "#dcfce7" };
  if (workFlow === 6 || workFlow === 8) return { backgroundColor: "#fef3c7" };
  return undefined;
};

const columns = [
  { heading: "ID", accessor: "Id", width: "90px" },
  { heading: "Amount (Rs)", accessor: "Amount", width: "130px" },
  { heading: "Cashier Name", accessor: "CashierName", width: "180px" },
  { heading: "Collector Name", accessor: "CollectorName", width: "180px" },
  { heading: "To Collector", accessor: "ToCollectorName", width: "180px" },
  { heading: "Retailer Name", accessor: "RetailerName", width: "220px" },
  { heading: "Transaction Type", accessor: "TransactionType", width: "150px" },
  { heading: "Workflow", accessor: "WorkFlow", width: "130px" },
  { heading: "Date", accessor: "Date", width: "130px" },
  { heading: "Given On", accessor: "GivenOn", width: "130px" },
  { heading: "Comment", accessor: "Comment", width: "240px" },
  { heading: "Actions", accessor: "Actions", width: "110px" },
];

export default function PendingApprovalsForCollector({ collectorUserId }) {
  useDocumentTitle("Pending Approvals");
  const { refreshPendingApprovals } = useCollectorApprovalGate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [filters, setFilters] = useState({});
  const [masterData, setMasterData] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchPendingApprovals();
  }, [showAll]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const [master, approvals] = await Promise.all([
        apiBase.getMasterData(),
        apiBase.getPendingApprovalsByCollectorId(collectorUserId, showAll),
      ]);
      setMasterData(master || {});
      setPendingApprovals(approvals);
      await refreshPendingApprovals();
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getMasterValue = (type, value) =>
    masterData?.[type]?.find((x) => x.Id == value)?.Description || value;

  const handleFilterChange = (accessor, value) => {
    setFilters((prev) => ({ ...prev, [accessor]: value }));
  };

  const onSort = (accessor) => {
    if (accessor === "Actions") return;
    setSortConfig((prev) =>
      prev.key === accessor
        ? { key: accessor, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key: accessor, direction: "asc" }
    );
  };

  const filteredData = sortTableRows(
    pendingApprovals.filter((item) =>
      columns.every(({ accessor }) => {
        const filter = filters[accessor];
        if (!filter) return true;
        const value = String(item[accessor] ?? "").toLowerCase();
        return value.includes(filter.toLowerCase());
      })
    ),
    sortConfig,
    (item, key) => {
      if (key === "TransactionType") return getMasterValue("TransactionTypes", item.TransactionType);
      if (key === "WorkFlow") return getMasterValue("WorkFlows", item.WorkFlow);
      return item[key];
    }
  );

  const renderCell = (item, accessor) => {
    const value = item[accessor];
    if (accessor === "Amount") return `Rs ${Number(value || 0).toFixed(2)}`;
    if (accessor === "Date" || accessor === "GivenOn") {
      return formatToCustomDateTime(value) || "-";
    }
    return value || "-";
  };

  const openLedger = (data) => {
    if (!data || data.WorkFlow === "5" || data.WorkFlow === "3") return;
    setEditData(data);
    setModalOpen(true);
  };

  const handleLedgerSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date().toISOString(),
        CollectorId: data.TransactionType === "2" ? "" : data.CollectorId,
        CollectorName: data.TransactionType === "2" ? "" : data.CollectorName,
        ToCollector: data.ToCollector || "",
        ToCollectorName: data.ToCollectorName || "",
        RetailerId: data.RetailerId,
      };
      await apiBase.updateLedgerInfo(payload);
      await fetchPendingApprovals();
      setModalOpen(false);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-4">
      <div className="shrink-0 rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="flex min-h-[42px] items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={showAll}
            aria-label="Show All"
            onClick={() => setShowAll((value) => !value)}
            className={`app-switch ${showAll ? "is-active" : ""}`}
          >
            <span className="app-switch-thumb" />
          </button>
          <span className="text-sm font-medium text-slate-700">Show All</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white shadow">
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          {error && <div className="text-red-600">{error}</div>}

          <div className="relative min-h-0 flex-1">
            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                <CenterLoader label="Loading pending approvals..." />
              </div>
            )}

            <div className="app-table-shell min-h-0 h-full overflow-auto">
              <table className="app-table min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="sticky top-0 z-20 px-4 py-2 text-left text-xs font-medium uppercase text-gray-700"
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        maxWidth: col.width,
                        background:
                          "linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(226, 232, 240, 0.9))",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onSort(col.accessor)}
                        className="flex items-center gap-1 text-left"
                      >
                        <span>{col.heading}</span>
                        <span className="text-[10px] text-slate-400">
                          {sortConfig.key === col.accessor
                            ? sortConfig.direction === "asc"
                              ? "▲"
                              : "▼"
                            : "↕"}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="sticky z-20 px-4 py-1 text-left"
                      style={{
                        top: "46px",
                        width: col.width,
                        minWidth: col.width,
                        maxWidth: col.width,
                        background: "rgba(255, 255, 255, 0.98)",
                      }}
                    >
                      {["TransactionType", "WorkFlow"].includes(col.accessor) && masterData ? (
                        <select
                          value={filters[col.accessor] || ""}
                          onChange={(e) => handleFilterChange(col.accessor, e.target.value)}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="">All</option>
                          {masterData[col.accessor + "s"]?.map((opt) => (
                            <option key={opt.Id} value={opt.Id}>
                              {opt.Description}
                            </option>
                          ))}
                        </select>
                      ) : (
                        col.accessor !== "Actions" && (
                          <input
                            type="text"
                            placeholder="Filter..."
                            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            value={filters[col.accessor] || ""}
                            onChange={(e) => handleFilterChange(col.accessor, e.target.value)}
                          />
                        )
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr
                      key={item.Id}
                      className="cursor-pointer"
                    >
                      {columns.map((col) => {
                        const val = col.accessor;
                        const workflowRowStyle = getWorkflowRowStyle(item.WorkFlow);

                        if (val === "Id") {
                          return (
                            <td key={val} className="px-4 py-2" style={workflowRowStyle}>
                              {[1].includes(item.WorkFlow) ? (
                                <Tooltip content={String(item[val] ?? "")} className="block w-full">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openLedger(item);
                                    }}
                                    className="w-full text-left text-indigo-600 underline hover:text-indigo-800"
                                  >
                                    <TruncatedCell>{item[val]}</TruncatedCell>
                                  </button>
                                </Tooltip>
                              ) : (
                                <TruncatedCell>{item[val]}</TruncatedCell>
                              )}
                            </td>
                          );
                        }

                        if (val === "TransactionType") {
                          return (
                            <td key={val} className="px-4 py-2" style={workflowRowStyle}>
                              <TruncatedCell>
                                {getMasterValue("TransactionTypes", item.TransactionType)}
                              </TruncatedCell>
                            </td>
                          );
                        }

                        if (val === "WorkFlow") {
                          return (
                            <td key={val} className="px-4 py-2" style={workflowRowStyle}>
                              <TruncatedCell>{getMasterValue("WorkFlows", item.WorkFlow)}</TruncatedCell>
                            </td>
                          );
                        }

                        if (val === "Actions") {
                          return (
                            <td key={val} className="px-4 py-2" style={workflowRowStyle}>
                              {item.DocId ? (
                                <TooltipIconButton
                                  label="Download File"
                                  onClick={() => handleDownloadFile(item.DocId, item.Id)}
                                  className="ml-2 text-left text-sm text-blue-600 hover:underline"
                                >
                                  <Download className="h-4 w-4" />
                                </TooltipIconButton>
                              ) : null}
                            </td>
                          );
                        }

                        return (
                          <td key={val} className="px-4 py-2" style={workflowRowStyle}>
                            <TruncatedCell>{renderCell(item, val)}</TruncatedCell>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ApprovalLedgerModal
          masterData={masterData}
          initialData={editData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleLedgerSubmit}
        />
      )}
    </div>
  );
}

function CenterLoader({ label }) {
  return (
    <div className="app-loading-state">
      <div className="app-loading-card">
        <div className="app-spinner" />
        <div className="app-loading-label">{label}</div>
      </div>
    </div>
  );
}
