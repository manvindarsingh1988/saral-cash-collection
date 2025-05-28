import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import {
  formatIndianNumber,
  formatToCustomDateTime,
  getRowColor,
} from "../../lib/utils";
import RetailerLedgerModal from "../../components/retailer/RetailerLedgerModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const columns = [
  { key: "Id", label: "ID", width: "40px" },
  { key: "TransactionTypes", label: "Transaction Type", width: "120px" },
  { key: "Amount", label: "Amount", width: "100px" },
  { key: "WorkFlows", label: "Workflow", width: "120px" },
  { key: "CollectorName", label: "Collector", width: "150px" },
  { key: "Date", label: "Transaction Date", width: "100px" },
  { key: "GivenOn", label: "Given On", width: "100px" },
  { key: "Comment", label: "Remarks", width: "130px" },
  { key: "Actions", label: "Actions", width: "60px" },
];

export default function RetailDashboard({ retailUserId }) {
  useDocumentTitle("Retail Dashboard");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [liability, setLiability] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState({
    CollectorId: "",
    Amount: "",
    TransactionTypes: "",
    WorkFlows: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  // Load master data once on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [masterData, collectorData] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getMappedCollectorsByRetailerId(retailUserId),
        ]);

        setMasterData(masterData);
        setCollectors(collectorData);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };
    loadMasterData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [showAll]);

  const fetchData = async () => {
    if (!retailUserId) return;

    try {
      const [ledgerData, liabilityData] = await Promise.all([
        apiBase.getLadgerInfoByRetailerid(showAll, retailUserId),
        apiBase.getLiabilityAmountByRetailerId(retailUserId),
      ]);

      setLiability(liabilityData);
      setLedger(ledgerData);
    } catch (err) {
      console.error("Error:", err);
      setLiability(null);
      setLedger(null);
    }
  };

  const getMasterValue = (type, id) => {
    const list = masterData?.[type] || [];
    return list.find((x) => x.Id == id)?.Description || id;
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
    try {
      data.RetailerId = retailUserId;
      const payload = {
        ...data,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: data?.StuckInBank ? 6 : 1,
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date().toISOString(),
        CollectorId: data.TransactionType == "2" ? "" : data.CollectorId,
        CollectorName: data.TransactionType == "2" ? "" : data.CollectorName,
      };

      if (editData?.Id) {
        await apiBase.updateLedgerInfo(payload);
      } else {
        await apiBase.addLedgerInfo(payload);
      }

      await fetchData();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleDeleteLedger = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ledger entry?"))
      return;

    try {
      await apiBase.deleteLedgerInfo(id); // Make sure this API exists
      await fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredData = (ledger || []).filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (key === "WorkFlows") {
        key = "WorkFlow";
      } else if (key === "TransactionTypes") {
        key = "TransactionType";
      }

      if (!value) return true;
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          {liability && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Liability
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.LaibilityAmount)}
                  </dd>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Total pending approval
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.PendingApprovalAmount)}
                  </dd>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Total rejected amount
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.RejectedAmount)}
                  </dd>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Projection Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.ProjectionAmount)}
                  </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Closing Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.ClosingAmount)}
                  </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Current Amount
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹ {formatIndianNumber(liability.CurrentAmount)}
                  </dd>
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <button
                  // disabled={liability.LaibilityAmount}
                  onClick={openAddLedger}
                  className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                >
                  Add Ledger Entry
                </button>
              </div>

              <div className="flex justify-start mb-2">
                <input
                  type="checkbox"
                  id="show-all"
                  checked={showAll}
                  onChange={() => {
                    setShowAll(!showAll);
                  }}
                />
                <label
                  htmlFor="show-all"
                  className="ml-2 text-md text-black-500"
                >
                  Show All
                </label>
              </div>

              {ledger?.length > 0 && (
                <div className="overflow-y-auto border border-gray-200 rounded h-[400px]">
                  <table className="w-full table-auto divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {columns.map(({ key, label, width }) => (
                          <th
                            key={key}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                            style={{ width, whiteSpace: "nowrap" }}
                          >
                            <div className="flex flex-col min-w-fit">
                              <span>{label}</span>
                              {["TransactionTypes", "WorkFlows"].includes(
                                key
                              ) && masterData ? (
                                <select
                                  value={filters[key]}
                                  onChange={(e) =>
                                    handleFilterChange(key, e.target.value)
                                  }
                                  className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                  style={{ width }}
                                >
                                  <option value="">All</option>
                                  {masterData[key]?.map((opt) => (
                                    <option key={opt.Id} value={opt.Id}>
                                      {opt.Description}
                                    </option>
                                  ))}
                                </select>
                              ) : key === "Actions" ? (
                                ""
                              ) : (
                                <input
                                  type="text"
                                  //style={{ width }}
                                  value={filters[key] || ""}
                                  onChange={(e) =>
                                    handleFilterChange(key, e.target.value)
                                  }
                                  className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                  placeholder="Filter"
                                />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-xs">
                      {filteredData.map((item) => {
                        return (
                          <tr
                            title="Click to edit"
                            key={item.Id}
                            // onClick={() => openEditLedger(item)}
                            className={`cursor-pointer ${getRowColor(
                              item.WorkFlow
                            )}`}
                          >
                            <td className="px-4 py-2">
                              {item.WorkFlow == "5" ? (
                                <span className="text-green-600">
                                  {item.Id}
                                </span>
                              ) : (
                                <a
                                  title="Click to edit"
                                  className="text-blue-600 underline hover:text-blue-800"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openEditLedger(item);
                                  }}
                                >
                                  {item.Id}
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {getMasterValue(
                                "TransactionTypes",
                                item.TransactionType
                              )}
                            </td>
                            <td className="px-4 py-2">
                              ₹{formatIndianNumber(item.Amount)}
                            </td>
                            <td className="px-4 py-2">
                              {getMasterValue("WorkFlows", item.WorkFlow)}
                            </td>
                            <td className="px-4 py-2">{item.CollectorName}</td>
                            <td className="px-4 py-2">
                              {formatToCustomDateTime(item.Date)}
                            </td>
                            <td className="px-4 py-2">
                              {formatToCustomDateTime(item.GivenOn)}
                            </td>
                            <td className="px-4 py-2 break-words max-w-[200px]">
                              {item.Comment}
                            </td>
                            <td className="px-4 py-2">
                              {getMasterValue("WorkFlows", item.WorkFlow) ===
                                "Initiate" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering row edit
                                    handleDeleteLedger(item.Id);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {(!ledger || (liability && liability.Amt <= 0)) && (
            <div className="text-gray-500 mt-4">Loading...</div>
          )}
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
    </>
  );
}
