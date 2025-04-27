import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase"; // Adjust if needed
import useDocumentTitle from "../../hooks/useDocumentTitle"; // Optional
import CollectorLedgerModal from "../../components/collector/CollectorLedgerModal";

const columns = [
    { key: "Id", label: "ID", width: "50px" },
    { key: "Cashier", label: "Cashier", width: "150px" },
    { key: "Amount", label: "Amount", width: "100px" },
    { key: "TransactionType", label: "Transaction Type", width: "150px" },
    { key: "WorkFlow", label: "Workflow", width: "120px" },
    { key: "GivenOn", label: "Given On", width: "120px" },
    { key: "Date", label: "Date", width: "120px" },
    { key: "Comments", label: "Comments", width: "150px" },
];

export default function CollectorLedger({ collectorUserId }) {
    useDocumentTitle("Collector Ledger");

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [collectorLedgers, setCollectorLedgers] = useState([]);
    const [filteredLedgers, setFilteredLedgers] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [masterData, setMasterData] = useState(null);
    const [cashiers, setCashiers] = useState([]);
    const [selectedLedger, setSelectedLedger] = useState(null);

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

    const fetchCollectorLedgers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiBase.getLedgerInfoByCollectorId(
                selectedDate,
                collectorUserId
            );
            setCollectorLedgers(data);
            setFilteredLedgers(data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch collector ledgers");
        } finally {
            setLoading(false);
        }
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
                    const cashierName = cashiers.find(c => c.Id === item.CashierId)?.Name || "";
                    return cashierName.toLowerCase().includes(filterValue.toLowerCase());
                }
                if (filterKey === "TransactionType" || filterKey === "WorkFlow") {
                    return item[filterKey]?.toString() === filterValue;
                }
                if (filterKey === "Comments") {
                    return (item.Comment || "").toLowerCase().includes(filterValue.toLowerCase());
                }
                return (item[filterKey] || "").toString().toLowerCase().includes(filterValue.toLowerCase());
            });
        });

        setFilteredLedgers(filtered);
    };

    return (
        <div className="spacer-6">
            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        onClick={fetchCollectorLedgers}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                        🔍 Search
                    </button>
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

            {/* Grid Section */}
            <div className="bg-white rounded-lg shadow p-6">
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-600">{error}</div>}

                {!loading && filteredLedgers.length >= 0 && (
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
                                                {["TransactionType", "WorkFlow"].includes(key) && masterData ? (
                                                    <select
                                                        value={filters[key] || ""}
                                                        onChange={(e) =>
                                                            handleFilterChange(key, e.target.value)
                                                        }
                                                        className="mt-1 px-1 py-0.5 border border-gray-300 rounded text-xs"
                                                        style={{ width }}
                                                    >
                                                        <option value="">All</option>
                                                        {masterData[key + "s"]?.map((opt) => (
                                                            <option key={opt.Id} value={opt.Id}>
                                                                {opt.Description}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        style={{ width }}
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
                                {filteredLedgers.map((item) => (
                                    <tr
                                        key={item.Id}
                                        className="cursor-pointer hover:bg-gray-100"
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
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {cashiers.find(c => c.Id === item.CashierId)?.Name || ""}
                                        </td>
                                        <td
                                            className="px-2 py-2"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            ₹{formatIndianNumber(item.Amount)}
                                        </td>
                                        <td
                                            className="px-2 py-2"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {getMasterValue("TransactionTypes", item.TransactionType)}
                                        </td>
                                        <td
                                            className="px-2 py-2"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {getMasterValue("WorkFlows", item.WorkFlow)}
                                        </td>
                                        <td
                                            className="px-2 py-2"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {item.GivenOn ? new Date(item.GivenOn).toLocaleDateString() : "-"}
                                        </td>
                                        <td
                                            className="px-2 py-2"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {item.Date ? new Date(item.Date).toLocaleDateString() : "-"}
                                        </td>
                                        <td
                                            className="px-2 py-2 break-words max-w-[200px]"
                                            onClick={() => openEditLedger(item)}
                                        >
                                            {item.Comment}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CollectorLedgerModal
                collectorId={collectorUserId}
                masterData={masterData}
                cashiers={cashiers}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                modelFor="CollectorLedger"
                initialData={selectedLedger} // pass selected ledger here
            />
        </div>
    );
}
