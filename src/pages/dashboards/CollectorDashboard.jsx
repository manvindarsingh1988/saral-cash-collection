import React, { use, useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import {
  formatIndianNumber,
  formatToCustomDateTime,
  getRowColor,
} from "../../lib/utils";
import CollectorLedgerModal from "../../components/LedgerModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const columns = [
  { key: "Id", label: "ID", width: "50px" },
  { key: "CollectorName", label: "Collector", width: "150px" },
  { key: "Amount", label: "Amount", width: "100px" },
  { key: "TransactionTypes", label: "Transaction Type", width: "120px" },
  { key: "WorkFlows", label: "Workflow", width: "120px" },
  { key: "Date", label: "Transaction Date", width: "100px" },
  { key: "GivenOn", label: "Given On", width: "100px" },
  { key: "Comment", label: "Remarks", width: "150px" },
  { key: "Action", label: "Action" },
];

export default function CollectorDashboard({ collectorUserId }) {
  useDocumentTitle("Collector Dashboard");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");
  const [liability, setLiability] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [retailers, setRetailers] = useState([]);
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
        const [master, retailers] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getMappedUsersByCollectorId(collectorUserId),
        ]);
        setMasterData(master);
        setRetailers(retailers);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    if (selectedRetailerId) {
      fetchData();
    }
  }, [showAll]);

  const fetchData = async () => {
    if (!collectorUserId || !selectedRetailerId) {
      alert("Please select retailer.");
      return;
    }

    try {
      const [ledgerData, liabilityData] = await Promise.all([
        apiBase.getLadgerInfoByRetaileridAndCollectorId(
          showAll,
          selectedRetailerId,
          collectorUserId
        ),
        apiBase.getLiabilityAmountByRetailerId(selectedRetailerId),
      ]);

      setLiability(liabilityData);
      setLedger(ledgerData);
    } catch (err) {
      console.error("Fetch failed:", err);
      setLedger(null);
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

  const openAddLedger = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditLedger = (data) => {
    if (
      !data ||
      data.WorkFlow == "5" ||
      data.WorkFlow == "3" ||
      data.WorkFlow == "2"
    )
      return;
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

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Retailer Dropdown */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-indigo-700 mb-1">
                  Select Retailer
                </label>
                <select
                  value={selectedRetailerId}
                  onChange={(e) => setSelectedRetailerId(e.target.value)}
                  className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Retailer</option>
                  {retailers.map((r) => (
                    <option key={r.RetailerUserId} value={r.RetailerUserId}>
                      {r.RetailerUserName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={fetchData}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200 mt-2 sm:mt-0"
              >
                🔍 Search
              </button>
            </div>
          </div>
        </div>

        {liability && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">Liability</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₹ {formatIndianNumber(liability.LaibilityAmount)}
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
                Pending Approval Amount
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₹ {formatIndianNumber(liability.PendingApprovalAmount)}
              </dd>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <dt className="text-sm font-medium text-gray-500">
                Rejected Amount
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ₹ {liability.RejectedAmount}
              </dd>
            </div>
          </div>
        )}

        {filteredData.length > 0 ? (
          <>
            <div className="flex justify-start mb-2">
              <input
                type="checkbox"
                id="show-all"
                checked={showAll}
                onChange={() => {
                  setShowAll(!showAll);
                }}
              />
              <label htmlFor="show-all" className="ml-2 text-md text-black-500">
                Show All
              </label>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="overflow-y-auto border border-gray-200 rounded h-[400px]">
                <table className="w-full table-auto divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      {columns.map(({ key, label, width }) => (
                        <th
                          key={key}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <div className="flex flex-col min-w-fit">
                            <span>{label}</span>
                            {["TransactionTypes", "WorkFlows"].includes(key) &&
                            masterData ? (
                              <select
                                value={filters[key]}
                                onChange={(e) =>
                                  handleFilterChange(key, e.target.value)
                                }
                                className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                // style={{ width }}
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
                                // style={{ width }}
                                value={filters[key] || ""}
                                onChange={(e) =>
                                  handleFilterChange(key, e.target.value)
                                }
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
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr
                        title="Click to edit"
                        key={item.Id}
                        // onClick={() => openEditLedger(item)}
                        className={`cursor-pointer hover:bg-gray-100 ${getRowColor(
                          item.WorkFlow
                        )}`}
                      >
                        <td className="px-4 py-2">
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
                        </td>
                        <td className="px-4 py-2">{item.CollectorName}</td>
                        <td className="px-4 py-2">
                          ₹ {formatIndianNumber(item.Amount)}
                        </td>
                        <td className="px-4 py-2">
                          {getMasterValue(
                            "TransactionTypes",
                            item.TransactionType
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {getMasterValue("WorkFlows", item.WorkFlow)}
                        </td>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-y-auto border border-gray-200 rounded h-[400px] flex items-center justify-center">
              <p className="text-gray-500 text-lg">
                No data available for selected date.
              </p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CollectorLedgerModal
          masterData={masterData}
          isOpen={isModalOpen}
          onClose={updateData}
          onSubmit={handleLedgerSubmit}
          initialData={editData}
          modelFor="RetailerLedger"
          collectorId={collectorUserId}
        />
      )}
    </>
  );
}
