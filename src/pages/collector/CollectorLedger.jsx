import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase"; // Adjust if needed
import useDocumentTitle from "../../hooks/useDocumentTitle"; // Optional
import CollectorLedgerModal from "../../components/collector/CollectorLedgerModal";
import { formatToCustomDateTime, getRowColor } from "../../lib/utils";

const columns = [
  { key: "Id", label: "ID", width: "50px" },
  { key: "Cashier", label: "Cashier", width: "150px" },
  { key: "Amount", label: "Amount", width: "100px" },
  { key: "TransactionType", label: "Transaction Type", width: "150px" },
  { key: "WorkFlow", label: "Workflow", width: "120px" },
  { key: "GivenOn", label: "Given On", width: "120px" },
  { key: "Date", label: "Date", width: "120px" },
  { key: "Comments", label: "Comments", width: "150px" },
  { key: "Action", label: "Actions", width: "100px" },
];

export default function CollectorLedger({ collectorUserId }) {
  useDocumentTitle("Collector Ledger");

  const [collectorLedgers, setCollectorLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [masterData, setMasterData] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [liability, setLiability] = useState({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [master, cashiers] = await Promise.all([
          apiBase.getMasterData(),
          apiBase.getCashiers(),
        ]);
        setMasterData(master);
        setCashiers(cashiers);
      } catch (err) {
        console.error("Failed to load master data:", err);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    fetchCollectorLedgers();
  }, [showAll]);

  const fetchCollectorLedgers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [data, liabilityData] = await Promise.all([
        apiBase.getLedgerInfoByCollectorId(showAll, collectorUserId),
        apiBase.getLiabilityAmountByCollectorId(collectorUserId, showAll),
      ]);

      setCollectorLedgers(data);
      setFilteredLedgers(data);
      setLiability(liabilityData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch collector ledgers");
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    setModalOpen(false);
    await fetchCollectorLedgers();
  };

  const openAddLedger = () => {
    setSelectedLedger(null); // reset selected ledger
    setModalOpen(true);
  };

  const openEditLedger = (ledger) => {
    setSelectedLedger(ledger);
    setModalOpen(true);
  };

  const formatIndianNumber = (num) => {
    return num?.toLocaleString("en-IN");
  };

  const getMasterValue = (key, id) => {
    const list = masterData?.[key] || [];
    return list.find((item) => item.Id === id)?.Description || "";
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    let filtered = collectorLedgers.filter((item) => {
      return Object.keys(updatedFilters).every((filterKey) => {
        const filterValue = updatedFilters[filterKey];
        if (!filterValue) return true;

        if (filterKey === "Cashier") {
          const cashierName =
            cashiers.find((c) => c.Id === item.CashierId)?.Name || "";
          return cashierName.toLowerCase().includes(filterValue.toLowerCase());
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
      });
    });

    setFilteredLedgers(filtered);
  };

  const handleDeleteLedger = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ledger entry?"))
      return;

    try {
      await apiBase.deleteLedgerInfo(id); // Make sure this API exists
      await fetchCollectorLedgers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="spacer-6">
      {liability && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">Liability</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹ {formatIndianNumber(liability.LaibilityAmount)}
            </dd>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">
              Rejected Amount
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹ {formatIndianNumber(liability.RejectedAmount)}
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
              Projection Amount
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹ {formatIndianNumber(liability.ProjectionAmount)}
            </dd>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <dt className="text-sm font-medium text-gray-500">
              Retailer Initiated Amount
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ₹ {formatIndianNumber(liability.RetailerInitiatedAmount)}
            </dd>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          onClick={openAddLedger}
          className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
        >
          Add Ledger Entry
        </button>
      </div>

      {/* Grid Section */}
      <div className="bg-white rounded-lg shadow p-6">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && filteredLedgers.length >= 0 && (
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
            <div className="overflow-y-auto border border-gray-200 rounded h-[400px]">
              <table className="w-full table-auto divide-y divide-gray-200 text-sm">
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
                          {["TransactionType", "WorkFlow"].includes(key) &&
                          masterData ? (
                            <select
                              value={filters[key] || ""}
                              onChange={(e) =>
                                handleFilterChange(key, e.target.value)
                              }
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
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {filteredLedgers.map((item) => (
                    <tr
                      key={item.Id}
                      className={`cursor-pointer hover:bg-gray-100 ${getRowColor(
                        item.WorkFlow
                      )}`}
                    >
                      <td className="px-2 py-2">
                        <button
                          className="text-indigo-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditLedger(item);
                          }}
                        >
                          {item.Id}
                        </button>
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        {item.CashierName}
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        ₹{formatIndianNumber(item.Amount)}
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        {getMasterValue(
                          "TransactionTypes",
                          item.TransactionType
                        )}
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        {getMasterValue("WorkFlows", item.WorkFlow)}
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        {formatToCustomDateTime(item.GivenOn)}
                      </td>
                      <td
                        className="px-2 py-2"
                      >
                        {formatToCustomDateTime(item.Date)}
                      </td>
                      <td
                        className="px-2 py-2 break-words max-w-[200px]"
                      >
                        {item.Comment}
                      </td>
                      <td className="px-2 py-2">
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
          </>
        )}
      </div>

      {isModalOpen && (
        <CollectorLedgerModal
          collectorId={collectorUserId}
          masterData={masterData}
          cashiers={cashiers}
          onClose={updateData}
          modelFor="CollectorLedger"
          initialData={selectedLedger}
        />
      )}
    </div>
  );
}
