import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import SearchableSelect from "../../components/SearchableSelect";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import CollectorLedger from "../collector/CollectorLedger";

export default function CollectorView() {
  useDocumentTitle("Collector View");

  const [collectors, setCollectors] = useState([]);
  const [selectedCollectorId, setSelectedCollectorId] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiBase.getCollectors();
        setCollectors(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load collectors.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-3 sm:max-w-2xl">
          <label className="text-base font-semibold text-gray-700">
            Select Collector
          </label>
          <SearchableSelect
            value={selectedCollectorId}
            onChange={(nextCollectorId) => {
              setSelectedCollectorId(nextCollectorId);
              setViewLoading(Boolean(nextCollectorId));
            }}
            options={collectors.map((collector) => ({
              value: collector.Id,
              label: `${collector.UserName} (${collector.Id})`,
            }))}
            placeholder="Select Collector"
            searchPlaceholder="Search collector..."
            buttonClassName="min-h-[60px] text-base"
            panelClassName="text-base"
          />
          {loading && <div className="text-sm text-gray-500">Loading collectors...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {selectedCollectorId ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {viewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 text-gray-600 shadow">
              Loading collector view...
            </div>
          )}
          <div
            className={`flex h-full min-h-0 flex-col overflow-hidden ${
              viewLoading ? "pointer-events-none opacity-0" : ""
            }`}
          >
            <CollectorLedger
              key={selectedCollectorId}
              collectorUserId={selectedCollectorId}
              documentTitle="Collector View"
              onLoadingChange={setViewLoading}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-white p-10 text-center text-gray-500 shadow">
          Select a collector to load the ledger view.
        </div>
      )}
    </div>
  );
}
