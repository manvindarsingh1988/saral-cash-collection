import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import LedgerModal from "../../components/LedgerModal";
import Tooltip from "../../components/Tooltip";
import TooltipIconButton from "../../components/TooltipIconButton";
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
    <label className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={label}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          active ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
            active ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
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
    <div className="spacer-6">
      {liability && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-8">
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
            <div key={label} className="bg-white shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                Rs {formatIndianNumber(value)}
              </dd>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && filteredLedgers.length >= 0 && (
          <>
            <div className="mb-2 flex items-center justify-between gap-4">
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
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Add Ledger Entry
                </button>
              </div>
            </div>

            <div className="overflow-y-auto border border-gray-200 rounded h-[400px]">
              <table className="w-full table-auto divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    {columns.map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <div className="flex flex-col min-w-fit">
                          <span>{label}</span>
                          {["TransactionType", "WorkFlow"].includes(key) && masterData ? (
                            <select
                              value={filters[key] || ""}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
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
                              className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                              placeholder="Filter"
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {filteredLedgers.map((item) => {
                    const rowStyle = getWorkflowRowStyle(item.WorkFlow);

                    return (
                      <tr key={item.Id} className="cursor-pointer">
                        <td className="px-2 py-2" style={rowStyle}>
                          {item.WorkFlow == "5" || item.WorkFlow == "3" ? (
                            <span className="text-green-600">{item.Id}</span>
                          ) : (
                            <Tooltip content="Click to edit">
                              <a
                                className="text-blue-600 underline hover:text-blue-800"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openEditLedger(item);
                                }}
                              >
                                {item.Id}
                              </a>
                            </Tooltip>
                          )}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {item.CashierName}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {item.ToCollectorName || item.ToCollector || "-"}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          Rs {formatIndianNumber(item.Amount)}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {getMasterValue("TransactionTypes", item.TransactionType)}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {getMasterValue("WorkFlows", item.WorkFlow)}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {formatToCustomDateTime(item.GivenOn)}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {formatToCustomDateTime(item.Date)}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {formatToCustomDateTime(item.ValuationDate)}
                        </td>
                        <td className="px-2 py-2 break-words max-w-[200px]" style={rowStyle}>
                          {item.Comment}
                        </td>
                        <td className="px-2 py-2" style={rowStyle}>
                          {[1, 6].includes(item.WorkFlow) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLedger(item.Id);
                              }}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Delete
                            </button>
                          )}
                          {item.DocId ? (
                            <TooltipIconButton
                              label="Download File"
                              onClick={() => handleDownloadFile(item.DocId, item.Id)}
                              className="ml-2 text-blue-600 text-sm mb-1 hover:underline text-left"
                            >
                              <Download className="w-4 h-4" />
                            </TooltipIconButton>
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
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
