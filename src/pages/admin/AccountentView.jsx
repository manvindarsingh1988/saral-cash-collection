import React, { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import CollectorLiabilities from "./CollectorLiabilities";
import AdminDashboard from "../dashboards/AdminDashboard";

const tabs = [
  { key: "retailers", label: "Retailers" },
  { key: "collectors", label: "Collectors" },
];

export default function AccountentView() {
  useDocumentTitle("Accountent View");

  const [masterCashiers, setMasterCashiers] = useState([]);
  const [selectedMasterCashierId, setSelectedMasterCashierId] = useState("");
  const [activeTab, setActiveTab] = useState("retailers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMasterCashiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiBase.getUserExtendedInfo();
        setMasterCashiers(
          (data || []).filter((item) => Number(item.UserType) === 14)
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load accountents.");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterCashiers();
  }, []);

  const masterCashierOptions = useMemo(
    () =>
      masterCashiers.map((item) => ({
        value: item.Id,
        label: `${item.UserName} (${item.Id})`,
      })),
    [masterCashiers]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-3 sm:max-w-2xl">
          <label className="text-base font-semibold text-gray-700">
            Select Accountent
          </label>
          <SearchableSelect
            value={selectedMasterCashierId}
            onChange={setSelectedMasterCashierId}
            options={masterCashierOptions}
            placeholder="Select Accountent"
            searchPlaceholder="Search accountent..."
            buttonClassName="min-h-[60px] text-base"
            panelClassName="text-base"
          />
          {loading && <div className="text-sm text-gray-500">Loading accountents...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {selectedMasterCashierId ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          <div className="shrink-0 rounded-lg bg-white p-2 shadow">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeTab === "retailers" ? (
              <AdminDashboard
                key={`retailers-${selectedMasterCashierId}`}
                userType={14}
                id={selectedMasterCashierId}
              />
            ) : (
              <CollectorLiabilities
                key={`collectors-${selectedMasterCashierId}`}
                userType={14}
                id={selectedMasterCashierId}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-white p-10 text-center text-gray-500 shadow">
          Select an accountent to load retailer or collector liabilities.
        </div>
      )}
    </div>
  );
}
