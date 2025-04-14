import React, { useState } from "react";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import LedgerModal from "../../components/LedgerModal";

export default function RetailDashboard({ retailUserId = "RU00118" }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [liability, setLiability] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [filters, setFilters] = useState({
    CollectorId: "",
    Amount: "",
    TransactionType: "",
    WorkFlow: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  const fetchData = async (date) => {
    if (!retailUserId || !date) return;

    try {
      const [ledgerData, liabilityData, masterData, collectors] =
        await Promise.all([
          apiBase.getLadgerInfoByRetailerid(date, retailUserId),
          apiBase.GetLiabilityAmountByRetailerId(retailUserId, date),
          apiBase.getMasterData(),
          apiBase.getMappedCollectorsByRetailerId(retailUserId),
        ]);

      setCollectors(collectors);
      setMasterData(masterData);
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
    return list.find((x) => x.Id === id)?.Description || id;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddLedger = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditLedger = (data) => {
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
        WorkFlow: parseInt(data.WorkFlow),
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date(data.GivenOn).toISOString(),
      };

      if (editData?.Id) {
        await apiBase.updateLedgerInfo(payload);
      } else {
        await apiBase.addLedgeInfo(payload);
      }

      await fetchData(selectedDate);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const filteredData = (ledger || []).filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Retail Dashboard
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4 flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 border-gray-300"
            />
            <button
              onClick={() => fetchData(selectedDate)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {liability && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{formatIndianNumber(liability.Amt)}
                  </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Handover</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{formatIndianNumber(liability.HandoverAmt)}
                  </dd>
                </div>
                <div className="bg-white shadow rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {liability.Status}
                  </dd>
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <button
                  onClick={openAddLedger}
                  className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                >
                  Add Ledger Entry
                </button>
              </div>

              {ledger?.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {[
                          "Id",
                          "CollectorId",
                          "Amount",
                          "TransactionTypes",
                          "WorkFlows",
                          "Date",
                          "GivenOn",
                          "Comment",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            <div className="flex flex-col">
                              <span>{col}</span>
                              {["TransactionTypes", "WorkFlows"].includes(col) &&
                              masterData ? (
                                <select
                                  value={filters[col]}
                                  onChange={(e) =>
                                    handleFilterChange(col, e.target.value)
                                  }
                                  className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                >
                                  <option value="">All</option>
                                  {masterData[col]?.map((opt) => (
                                    <option key={opt.Id} value={opt.Id}>
                                      {opt.Description}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={filters[col]}
                                  onChange={(e) =>
                                    handleFilterChange(col, e.target.value)
                                  }
                                  className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {filteredData.map((item) => (
                        <tr
                          key={item.Id}
                          onClick={() => openEditLedger(item)}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          <td className="px-2 py-2 whitespace-nowrap">
                            {item.Id}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {item.CollectorName}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            ₹{formatIndianNumber(item.Amount)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {getMasterValue("TransactionTypes", item.TransactionType)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {getMasterValue("WorkFlows", item.WorkFlow)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {new Date(item.Date).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {new Date(item.GivenOn).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap max-w-[150px] truncate">
                            {item.Comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!ledger && selectedDate && (
            <div className="text-gray-500 mt-4">
              No data available for selected date.
            </div>
          )}
        </div>
      </div>

      <LedgerModal
        collectors={collectors}
        masterData={masterData}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleLedgerSubmit}
        initialData={editData}
      />
    </>
  );
}
