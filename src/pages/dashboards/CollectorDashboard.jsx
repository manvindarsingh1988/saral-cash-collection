import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import SearchableSelect from "../../components/SearchableSelect";
import Tooltip from "../../components/Tooltip";
import TruncatedCell from "../../components/TruncatedCell";
import {
  formatIndianNumber,
  formatToCustomDateTime,
  getRowColor,
} from "../../lib/utils";
import CollectorLedgerModal from "../../components/LedgerModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const columns = [
  { key: "Id", label: "ID", width: "80px" },
  { key: "CollectorName", label: "Collector", width: "220px" },
  { key: "Amount", label: "Amount", width: "140px" },
  { key: "TransactionTypes", label: "Transaction Type", width: "180px" },
  { key: "WorkFlows", label: "Workflow", width: "180px" },
  { key: "Date", label: "Transaction Date", width: "170px" },
  { key: "GivenOn", label: "Given On", width: "170px" },
  { key: "Comment", label: "Remarks", width: "220px" },
  { key: "Action", label: "Action", width: "120px" },
];

const summaryCards = [
  { key: "LaibilityAmount", label: "Liability", color: "#dc2626" },
  { key: "ProjectionAmount", label: "Projection Amount", color: "#7c3aed" },
  {
    key: "PendingApprovalAmount",
    label: "Pending Approval Amount",
    color: "#d97706",
  },
  { key: "RejectedAmount", label: "Rejected Amount", color: "#db2777" },
];

function SliderToggle({ checked, onChange, label }) {
  return (
    <div className="flex min-h-[42px] items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`app-switch ${checked ? "is-active" : ""}`}
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

export default function CollectorDashboard({ collectorUserId }) {
  useDocumentTitle("Collector Dashboard");

  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");
  const [liability, setLiability] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [masterData, setMasterData] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    CollectorId: "",
    Amount: "",
    TransactionTypes: "",
    WorkFlows: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [master, retailerList] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getMappedUsersByCollectorId(collectorUserId),
        ]);
        setMasterData(master || {});
        setRetailers(retailerList || []);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, [collectorUserId]);

  useEffect(() => {
    if (selectedRetailerId) {
      fetchData();
    }
  }, [selectedRetailerId, showAll]);

  const fetchData = async () => {
    if (!collectorUserId || !selectedRetailerId) {
      alert("Please select retailer.");
      return;
    }

    try {
      setLoading(true);
      const [ledgerData, liabilityData] = await Promise.all([
        apiBase.getLadgerInfoByRetaileridAndCollectorId(
          showAll,
          selectedRetailerId,
          collectorUserId
        ),
        apiBase.getLiabilityAmountByRetailerId(selectedRetailerId),
      ]);

      setLiability(liabilityData || null);
      setLedger(ledgerData || []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setLedger([]);
      setLiability(null);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    setModalOpen(false);
    await fetchData();
  };

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((x) => x.Id == id)?.Description || id;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openEditLedger = (data) => {
    if (
      !data ||
      data.WorkFlow == "5" ||
      data.WorkFlow == "3" ||
      data.WorkFlow == "2"
    ) {
      return;
    }
    setEditData(data);
    setModalOpen(true);
  };

  const handleLedgerSubmit = async (data) => {
    try {
      data.RetailerId = selectedRetailerId;
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: parseInt(data.WorkFlow),
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date(data.GivenOn).toISOString(),
      };

      if (editData?.Id) {
        await apiBase.updateLedgerInfo(payload);
      } else {
        await apiBase.addLedgerInfo(payload);
      }

      await fetchData();
      setModalOpen(false);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const filteredData = ledger.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      let resolvedKey = key;
      if (resolvedKey === "WorkFlows") {
        resolvedKey = "WorkFlow";
      } else if (resolvedKey === "TransactionTypes") {
        resolvedKey = "TransactionType";
      }

      if (!value) return true;
      const itemValue = item[resolvedKey];
      if (itemValue === null || itemValue === undefined) return false;

      const normalizedValue =
        resolvedKey === "TransactionType"
          ? getMasterValue("TransactionTypes", item.TransactionType)
          : resolvedKey === "WorkFlow"
          ? getMasterValue("WorkFlows", item.WorkFlow)
          : itemValue;

      return normalizedValue
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  });

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

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="shrink-0 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-indigo-700">
                Select Retailer
              </label>
              <SearchableSelect
                value={selectedRetailerId}
                onChange={setSelectedRetailerId}
                options={retailers.map((retailer) => ({
                  value: retailer.RetailerUserId,
                  label: `${retailer.RetailerUserName} (${retailer.RetailerUserId})`,
                }))}
                placeholder="Select Retailer"
                searchPlaceholder="Search retailer..."
              />
            </div>

            <button
              onClick={fetchData}
              className="app-button-primary shrink-0"
            >
              Search
            </button>
          </div>

          {filteredData.length > 0 ? (
            <SliderToggle
              checked={showAll}
              onChange={setShowAll}
              label="Show All"
            />
          ) : null}
        </div>
      </div>

      {liability ? (
        <div className="liability-summary grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(({ key, label, color }) => (
            <div key={key} className="metric-tile" style={{ "--tile-color": color }}>
              <dt className="metric-tile-label">{label}</dt>
              <dd className="metric-tile-value">
                Rs {formatIndianNumber(liability[key])}
              </dd>
            </div>
          ))}
        </div>
      ) : null}

      {filteredData.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
          <div className="relative min-h-0 flex-1">
            {loading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                <CenterLoader label="Loading collector data..." />
              </div>
            ) : null}

            <div className="app-table-shell min-h-0 h-full overflow-auto">
              <table className="app-table min-w-full divide-y divide-gray-200 text-xs">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    {columns.map(({ key, label, width }) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-700"
                        style={{ width, minWidth: width, maxWidth: width }}
                      >
                        <div className="flex flex-col min-w-fit">
                          <span>{label}</span>
                          {["TransactionTypes", "WorkFlows"].includes(key) &&
                          masterData ? (
                            <select
                              value={filters[key] || ""}
                              onChange={(e) =>
                                handleFilterChange(key, e.target.value)
                              }
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="">All</option>
                              {masterData[key]?.map((opt) => (
                                <option key={opt.Id} value={opt.Id}>
                                  {opt.Description}
                                </option>
                              ))}
                            </select>
                          ) : key !== "Action" ? (
                            <input
                              type="text"
                              value={filters[key] || ""}
                              onChange={(e) =>
                                handleFilterChange(key, e.target.value)
                              }
                              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              placeholder="Filter"
                            />
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredData.map((item) => (
                    <tr
                      key={item.Id}
                      className={`cursor-pointer hover:bg-gray-100 ${getRowColor(
                        item.WorkFlow
                      )}`}
                    >
                      <td className="px-4 py-2">
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
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.CollectorName || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>Rs {formatIndianNumber(item.Amount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>
                          {getMasterValue(
                            "TransactionTypes",
                            item.TransactionType
                          )}
                        </TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>
                          {getMasterValue("WorkFlows", item.WorkFlow)}
                        </TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{formatToCustomDateTime(item.Date)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{formatToCustomDateTime(item.GivenOn)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.Comment || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        {getMasterValue("WorkFlows", item.WorkFlow) ===
                        "Initiate" ? (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-6 shadow">
          <div className="app-table-shell flex min-h-0 flex-1 items-center justify-center">
            <p className="text-lg text-gray-500">
              {loading
                ? "Loading collector data..."
                : "No data available for selected retailer."}
            </p>
          </div>
        </div>
      )}

      {isModalOpen ? (
        <CollectorLedgerModal
          masterData={masterData}
          isOpen={isModalOpen}
          onClose={updateData}
          onSubmit={handleLedgerSubmit}
          initialData={editData}
          modelFor="RetailerLedger"
          collectorId={collectorUserId}
        />
      ) : null}
    </div>
  );
}
