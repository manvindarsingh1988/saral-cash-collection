import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import RetailerLedgerModal from "../../components/retailer/RetailerLedgerModal";
import Tooltip from "../../components/Tooltip";
import TooltipIconButton from "../../components/TooltipIconButton";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sanitiseLedgerPayload } from "../../lib/ledgerRuleEngine";
import {
  formatIndianNumber,
  formatToCustomDateTime,
  generateSafeGuid,
  handleDownloadFile,
  zipFilesToBlob,
} from "../../lib/utils";

const columns = [
  { key: "Id", label: "ID", width: "80px" },
  { key: "TransactionTypes", label: "Transaction Type", width: "170px" },
  { key: "Amount", label: "Amount", width: "130px" },
  { key: "WorkFlows", label: "Workflow", width: "170px" },
  { key: "CollectorName", label: "Collector", width: "220px" },
  { key: "Date", label: "Transaction Date", width: "170px" },
  { key: "GivenOn", label: "Given On", width: "170px" },
  { key: "Comment", label: "Remarks", width: "220px" },
  { key: "Actions", label: "Actions", width: "110px" },
];

const summaryCards = [
  { key: "ClosingAmount", label: "Opening Amount", color: "#0f766e" },
  { key: "LaibilityAmount", label: "Liability", color: "#dc2626" },
  { key: "PendingApprovalAmount", label: "Total Pending Approval", color: "#d97706" },
  { key: "PendingAmount", label: "Ewallet Pending Amount", color: "#0891b2" },
  { key: "RejectedAmount", label: "Today Fix Fund Charges", color: "#db2777" },
  { key: "ProjectionAmount", label: "Projection Amount", color: "#7c3aed" },
  { key: "CurrentAmount", label: "Current Amount", color: "#2563eb" },
];

const getWorkflowRowStyle = (workFlow) => {
  if (workFlow === 1) return { backgroundColor: "#dbeafe" };
  if (workFlow === 2 || workFlow === 4) return { backgroundColor: "#fee2e2" };
  if (workFlow === 5 || workFlow === 3) return { backgroundColor: "#dcfce7" };
  if (workFlow === 6 || workFlow === 8) return { backgroundColor: "#fef3c7" };
  return undefined;
};

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

export default function RetailDashboard({ retailUserId }) {
  useDocumentTitle("Retail Dashboard");

  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liability, setLiability] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [masterData, setMasterData] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [enableDateFilter, setEnableDateFilter] = useState(false);
  const [filters, setFilters] = useState({
    Id: "",
    Amount: "",
    TransactionTypes: "",
    WorkFlows: "",
    CollectorName: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [masterDataResponse, collectorData] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getMappedCollectorsByRetailerId(retailUserId),
        ]);

        setMasterData(masterDataResponse || {});
        setCollectors(collectorData || []);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, [retailUserId]);

  useEffect(() => {
    fetchData();
  }, [showAll, retailUserId]);

  const fetchData = async () => {
    if (!retailUserId) return;

    try {
      setLoading(true);
      const [ledgerData, liabilityData] = await Promise.all([
        apiBase.getLadgerInfoByRetailerid(showAll, retailUserId, fromDate, toDate),
        apiBase.getLiabilityAmountByRetailerId(retailUserId),
      ]);

      setLiability(liabilityData || null);
      setLedger(ledgerData || []);
    } catch (err) {
      console.error("Error:", err);
      setLiability(null);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((item) => item.Id == id)?.Description || id;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddLedger = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditLedger = (data) => {
    if (!data || data.WorkFlow == "5" || data.WorkFlow == "3") return;

    setEditData(data);
    setModalOpen(true);
  };

  const handleLedgerSubmit = async (data) => {
    const docId = data?.DocId || generateSafeGuid();
    let fileSaved = false;

    if (data.File) {
      try {
        const blob = await zipFilesToBlob(data.File);
        await apiBase.uploadFile(blob, docId);
        fileSaved = true;
      } catch (err) {
        console.error("File upload failed:", err);
        fileSaved = false;
      }
    }

    try {
      data.RetailerId = retailUserId;
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: data?.StuckInBank ? 6 : data?.StuckInCDM ? 8 : 1,
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date().toISOString(),
        CollectorId: data.TransactionType == "2" ? "" : data.CollectorId,
        CollectorName: data.TransactionType == "2" ? "" : data.CollectorName,
        DocId:
          data.File && fileSaved ? docId : editData?.Id ? editData.DocId : null,
      };

      const sanitizedPayload = sanitiseLedgerPayload(payload);

      if (editData?.Id) {
        const result = await apiBase.updateLedgerInfo(sanitizedPayload);
        if (result?.Response) {
          alert(result.Response);
        }
      } else {
        const result = await apiBase.addLedgerInfo(sanitizedPayload);
        if (result?.Response) {
          alert("Success: Ledger details added.");
        }
      }

      await fetchData();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed.");
    }
  };

  const handleDeleteLedger = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ledger entry?")) {
      return;
    }

    try {
      await apiBase.deleteLedgerInfo(id);
      await fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredData = ledger.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      let fieldKey = key;
      if (fieldKey === "WorkFlows") {
        fieldKey = "WorkFlow";
      } else if (fieldKey === "TransactionTypes") {
        fieldKey = "TransactionType";
      }

      if (!value) return true;
      const itemValue = item[fieldKey];
      if (itemValue === null || itemValue === undefined) return false;

      const normalizedValue =
        fieldKey === "TransactionType"
          ? getMasterValue("TransactionTypes", item.TransactionType)
          : fieldKey === "WorkFlow"
          ? getMasterValue("WorkFlows", item.WorkFlow)
          : itemValue;

      return normalizedValue
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    })
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {liability && (
        <div className="liability-summary grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {summaryCards.map(({ key, label, color }) => (
            <div key={key} className="metric-tile" style={{ "--tile-color": color }}>
              <dt className="metric-tile-label">{label}</dt>
              <dd className="metric-tile-value">Rs {formatIndianNumber(liability[key])}</dd>
            </div>
          ))}
        </div>
      )}

      <div className="shrink-0 rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex min-h-[42px] items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={enableDateFilter}
                aria-label="Search By Date Range"
                onClick={() => {
                  setEnableDateFilter((checked) => {
                    const next = !checked;
                    setShowAll(next);
                    const today = new Date().toISOString().split("T")[0];
                    setFromDate(today);
                    setToDate(today);
                    return next;
                  });
                }}
                className={`app-switch ${enableDateFilter ? "is-active" : ""}`}
              >
                <span className="app-switch-thumb" />
              </button>
              <span className="text-sm font-medium text-slate-700">
                Search By Date Range
              </span>
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-slate-700">From Date</label>
              <input
                type="date"
                disabled={!enableDateFilter}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`rounded border px-3 py-2 text-black transition ${
                  !enableDateFilter
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 opacity-60 blur-[0.4px]"
                    : "bg-white"
                }`}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-slate-700">To Date</label>
              <input
                type="date"
                disabled={!enableDateFilter}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`rounded border px-3 py-2 text-black transition ${
                  !enableDateFilter
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 opacity-60 blur-[0.4px]"
                    : "bg-white"
                }`}
              />
            </div>

            <div className="flex">
              <button
                disabled={!enableDateFilter}
                onClick={fetchData}
                className={`min-h-[42px] rounded-md px-5 py-2 text-sm font-semibold shadow-sm transition ${
                  !enableDateFilter
                    ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Search
              </button>
            </div>
          </div>

          <button
            onClick={openAddLedger}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Ledger Entry
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white shadow">
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          <div className="relative min-h-0 flex-1">
            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                <CenterLoader label="Loading retailer ledger..." />
              </div>
            )}

            <div className="app-table-shell min-h-0 h-full overflow-auto">
              <table className="app-table min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map(({ key, label, width }) => (
                      <th
                        key={key}
                        className="sticky top-0 z-20 px-4 py-2 text-left text-xs font-medium uppercase text-gray-700"
                        style={{
                          width,
                          minWidth: width,
                          maxWidth: width,
                          background:
                            "linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(226, 232, 240, 0.9))",
                        }}
                      >
                        <div className="flex flex-col min-w-fit">
                          <span>{label}</span>
                          {["TransactionTypes", "WorkFlows"].includes(key) && masterData ? (
                            <select
                              value={filters[key] || ""}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="">All</option>
                              {masterData[key]?.map((opt) => (
                                <option key={opt.Id} value={opt.Id}>
                                  {opt.Description}
                                </option>
                              ))}
                            </select>
                          ) : key === "Actions" ? null : (
                            <input
                              type="text"
                              value={filters[key] || ""}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="Filter"
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-xs">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                      const workflowRowStyle = getWorkflowRowStyle(item.WorkFlow);

                      return (
                        <tr key={item.Id} className="cursor-pointer">
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          {item.WorkFlow == "5" || item.WorkFlow == "3" ? (
                            <TruncatedCell className="text-green-600">{item.Id}</TruncatedCell>
                          ) : (
                            <Tooltip content="Click to edit" className="block w-full">
                              <button
                                className="w-full text-left text-blue-600 underline hover:text-blue-800"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openEditLedger(item);
                                }}
                              >
                                <TruncatedCell>{item.Id}</TruncatedCell>
                              </button>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>
                            {getMasterValue("TransactionTypes", item.TransactionType)}
                          </TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>Rs {formatIndianNumber(item.Amount)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>{getMasterValue("WorkFlows", item.WorkFlow)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>{item.CollectorName || "-"}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>{formatToCustomDateTime(item.Date)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>{formatToCustomDateTime(item.GivenOn)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <TruncatedCell>{item.Comment || "-"}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={workflowRowStyle}>
                          <div className="flex items-center gap-2">
                            {[1, 6].includes(item.WorkFlow) ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLedger(item.Id);
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            ) : null}
                            {item.DocId ? (
                              <TooltipIconButton
                                label="Download File"
                                onClick={() => handleDownloadFile(item.DocId, item.Id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Download className="h-4 w-4" />
                              </TooltipIconButton>
                            ) : null}
                          </div>
                        </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                        No records found.
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
        <RetailerLedgerModal
          collectors={collectors}
          masterData={masterData}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleLedgerSubmit}
          initialData={editData}
        />
      )}
    </div>
  );
}
