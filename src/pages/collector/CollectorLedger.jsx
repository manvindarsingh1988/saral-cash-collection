import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import LedgerModal from "../../components/LedgerModal";
import Tooltip from "../../components/Tooltip";
import TooltipIconButton from "../../components/TooltipIconButton";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import {
  formatToCustomDateTime,
  handleDownloadFile,
} from "../../lib/utils";

const columns = [
  { key: "Id", label: "ID", width: "60px" },
  { key: "Cashier", label: "Cashier", width: "220px" },
  { key: "ToCollector", label: "To Collector", width: "220px" },
  { key: "Amount", label: "Amount", width: "130px" },
  { key: "TransactionType", label: "Transaction Type", width: "180px" },
  { key: "WorkFlow", label: "Workflow", width: "180px" },
  { key: "GivenOn", label: "Given On", width: "180px" },
  { key: "Date", label: "Date", width: "180px" },
  { key: "ValuationDate", label: "Valuation Date", width: "180px" },
  { key: "Comments", label: "Comments", width: "220px" },
  { key: "Action", label: "Actions", width: "120px" },
];

const getWorkflowRowStyle = (workFlow) => {
  if (workFlow === 1) return { backgroundColor: "#dbeafe" };
  if (workFlow === 2 || workFlow === 4) return { backgroundColor: "#fee2e2" };
  if (workFlow === 5 || workFlow === 3) return { backgroundColor: "#dcfce7" };
  if (workFlow === 6 || workFlow === 8) return { backgroundColor: "#fef3c7" };
  return undefined;
};

function SliderToggle({ active, onToggle, label }) {
  return (
    <div className="flex min-h-[42px] items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={label}
        onClick={onToggle}
        className={`app-switch ${active ? "is-active" : ""}`}
      >
        <span className="app-switch-thumb" />
      </button>
      <span className="text-sm font-medium text-slate-700">{label}</span>
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

export default function CollectorLedger({
  collectorUserId,
  documentTitle = "Collector Ledger",
  onLoadingChange,
}) {
  useDocumentTitle(documentTitle);

  const [collectorLedgers, setCollectorLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [masterData, setMasterData] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [liability, setLiability] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [loadDashboardByValuationDate, setLoadDashboardByValuationDate] =
    useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [master, cashierList, collectorList] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getCashiers(),
          apiBase.getCollectors(),
        ]);
        setMasterData(master);
        setCashiers(cashierList);
        setCollectors(collectorList);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    fetchCollectorLedgers();
  }, [collectorUserId, showAll, loadDashboardByValuationDate]);

  const fetchCollectorLedgers = async () => {
    try {
      setLoading(true);
      onLoadingChange?.(true);
      setError(null);

      const [data, liabilityData] = await Promise.all([
        apiBase.getLedgerInfoByCollectorId(showAll, collectorUserId),
        apiBase.getLiabilityAmountByCollectorId(
          collectorUserId,
          loadDashboardByValuationDate
        ),
      ]);

      setCollectorLedgers(data || []);
      setFilteredLedgers(data || []);
      setLiability(liabilityData || {});
    } catch (err) {
      console.error(err);
      setError("Failed to fetch collector ledgers");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const updateData = async () => {
    setModalOpen(false);
  };

  const openAddLedger = () => {
    setSelectedLedger(null);
    setModalOpen(true);
  };

  const openEditLedger = (ledger) => {
    setSelectedLedger(ledger);
    setModalOpen(true);
  };

  const formatIndianNumber = (num) => num?.toLocaleString("en-IN");

  const getMasterValue = (key, id) => {
    const list = masterData?.[key] || [];
    return list.find((item) => item.Id === id)?.Description || "";
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    const filtered = collectorLedgers.filter((item) =>
      Object.keys(updatedFilters).every((filterKey) => {
        const filterValue = updatedFilters[filterKey];
        if (!filterValue) return true;

        if (filterKey === "Cashier") {
          const cashierName =
            cashiers.find((c) => c.Id === item.CashierId)?.Name || "";
          return cashierName.toLowerCase().includes(filterValue.toLowerCase());
        }

        if (filterKey === "ToCollector") {
          const toCollectorName =
            item.ToCollectorName ||
            collectors.find((collector) => `${collector.Id}` === `${item.ToCollector}`)
              ?.UserName ||
            "";
          return toCollectorName.toLowerCase().includes(filterValue.toLowerCase());
        }

        if (filterKey === "TransactionType" || filterKey === "WorkFlow") {
          return item[filterKey]?.toString() === filterValue;
        }

        if (filterKey === "Comments") {
          return (item.Comment || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }

        return (item[filterKey] || "")
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    );

    setFilteredLedgers(filtered);
  };

  const handleDeleteLedger = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ledger entry?")) {
      return;
    }

    try {
      await apiBase.deleteLedgerInfo(id);
      await fetchCollectorLedgers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      {liability && (
        <div className="liability-summary grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {[
            ["Opening Amount", liability.ClosingAmount],
            ["Liability", liability.LaibilityAmount],
            ["Pending Approval Amount", liability.PendingApprovalAmount],
            ["Projection Amount", liability.ProjectionAmount],
            ["Retailer Initiated Amount", liability.RetailerInitiatedAmount],
            ["Current Amount", liability.CurrentAmount],
            ["Collector Initiated Amount", liability.CollectorInitiatedAmount],
            ["Fund Added By Admin", liability.RejectedAmount],
          ].map(([label, value]) => (
            <div key={label} className="metric-tile">
              <dt className="metric-tile-label">{label}</dt>
              <dd className="metric-tile-value">Rs {formatIndianNumber(value)}</dd>
            </div>
          ))}
        </div>
      )}

      <div className="shrink-0 rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <SliderToggle
              label="Show All"
              active={showAll}
              onToggle={() => setShowAll((value) => !value)}
            />
            <SliderToggle
              label="Load dashboard by Valuation Date"
              active={loadDashboardByValuationDate}
              onToggle={() =>
                setLoadDashboardByValuationDate((value) => !value)
              }
            />
          </div>
          <div className="shrink-0">
            <button
              onClick={openAddLedger}
              className="app-button-primary"
            >
              Add Ledger Entry
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white shadow">
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          {error && <div className="mb-3 text-red-600">{error}</div>}

          <div className="relative min-h-0 flex-1">
            {loading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                <CenterLoader label="Loading collector ledgers..." />
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
                          {["TransactionType", "WorkFlow"].includes(key) && masterData ? (
                            <select
                              value={filters[key] || ""}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="">All</option>
                              {masterData[key + "s"]?.map((opt) => (
                                <option key={opt.Id} value={opt.Id}>
                                  {opt.Description}
                                </option>
                              ))}
                            </select>
                          ) : key !== "Action" ? (
                            <input
                              type="text"
                              value={filters[key] || ""}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="Filter"
                            />
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-xs">
                  {filteredLedgers.map((item) => {
                    const rowStyle = getWorkflowRowStyle(item.WorkFlow);

                    return (
                      <tr key={item.Id} className="cursor-pointer">
                        <td className="px-4 py-2" style={rowStyle}>
                          {item.WorkFlow == "5" || item.WorkFlow == "3" ? (
                            <TruncatedCell className="text-green-600">{item.Id}</TruncatedCell>
                          ) : (
                            <Tooltip content="Click to edit">
                              <a
                                className="text-blue-600 underline hover:text-blue-800"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openEditLedger(item);
                                }}
                              >
                                <TruncatedCell>{item.Id}</TruncatedCell>
                              </a>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{item.CashierName || "-"}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{item.ToCollectorName || item.ToCollector || "-"}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>Rs {formatIndianNumber(item.Amount)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>
                            {getMasterValue("TransactionTypes", item.TransactionType)}
                          </TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{getMasterValue("WorkFlows", item.WorkFlow)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{formatToCustomDateTime(item.GivenOn)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{formatToCustomDateTime(item.Date)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{formatToCustomDateTime(item.ValuationDate)}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <TruncatedCell>{item.Comment || "-"}</TruncatedCell>
                        </td>
                        <td className="px-4 py-2" style={rowStyle}>
                          <div className="flex items-center gap-2">
                            {[1, 6].includes(item.WorkFlow) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLedger(item.Id);
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                            {item.DocId ? (
                              <TooltipIconButton
                                label="Download File"
                                onClick={() => handleDownloadFile(item.DocId, item.Id)}
                                className="text-blue-600 text-sm hover:underline"
                              >
                                <Download className="h-4 w-4" />
                              </TooltipIconButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLedgers.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <LedgerModal
          userId={collectorUserId}
          masterData={masterData}
          cashiers={cashiers}
          collectors={collectors}
          onClose={updateData}
          modelFor="CollectorLedger"
          initialData={selectedLedger}
        />
      )}
    </div>
  );
}
