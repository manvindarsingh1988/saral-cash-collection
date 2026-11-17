import React, { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import CollectorLiabilities from "./CollectorLiabilities";
import AdminDashboard from "../dashboards/AdminDashboard";

const tabs = [
  { key: "retailers", label: "Retailer" },
  { key: "collectors", label: "Collector" },
];

export default function ZoneManagerView() {
  useDocumentTitle("Zone Manager View");

  const [zoneManagers, setZoneManagers] = useState([]);
  const [selectedZoneManagerId, setSelectedZoneManagerId] = useState("");
  const [activeTab, setActiveTab] = useState("retailers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchZoneManagers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiBase.getUserExtendedInfo();
        setZoneManagers(
          (data || []).filter((item) => Number(item.UserType) === 20)
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load zone managers.");
      } finally {
        setLoading(false);
      }
    };

    fetchZoneManagers();
  }, []);

  const zoneManagerOptions = useMemo(
    () =>
      zoneManagers.map((item) => ({
        value: item.Id,
        label: `${item.UserName} (${item.Id})`,
      })),
    [zoneManagers]
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-3 sm:max-w-2xl">
          <label className="text-base font-semibold text-gray-700">
            Select Zone Manager
          </label>
          <SearchableSelect
            value={selectedZoneManagerId}
            onChange={setSelectedZoneManagerId}
            options={zoneManagerOptions}
            placeholder="Select Zone Manager"
            searchPlaceholder="Search zone manager..."
            buttonClassName="min-h-[60px] text-base"
            panelClassName="text-base"
          />
          {loading && <div className="text-sm text-gray-500">Loading zone managers...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {selectedZoneManagerId ? (
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
                key={`retailers-${selectedZoneManagerId}`}
                userType={20}
                id={selectedZoneManagerId}
                showHeaderActions={false}
              />
            ) : (
              <CollectorLiabilities
                key={`collectors-${selectedZoneManagerId}`}
                userType={20}
                id={selectedZoneManagerId}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-white p-10 text-center text-gray-500 shadow">
          Select a zone manager to load retailer or collector liabilities.
        </div>
      )}
    </div>
  );
}
