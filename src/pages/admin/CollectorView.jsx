import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-2 sm:max-w-md">
          <label className="text-sm font-medium text-gray-700">
            Select Collector
          </label>
          <select
            value={selectedCollectorId}
            onChange={(e) => {
              const nextCollectorId = e.target.value;
              setSelectedCollectorId(nextCollectorId);
              setViewLoading(Boolean(nextCollectorId));
            }}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Select Collector</option>
            {collectors.map((collector) => (
              <option key={collector.Id} value={collector.Id}>
                {collector.UserName}
              </option>
            ))}
          </select>
          {loading && <div className="text-sm text-gray-500">Loading collectors...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {selectedCollectorId ? (
        <div className="relative">
          {viewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 text-gray-600 shadow">
              Loading collector view...
            </div>
          )}
          <div className={viewLoading ? "pointer-events-none opacity-0" : ""}>
            <CollectorLedger
              key={selectedCollectorId}
              collectorUserId={selectedCollectorId}
              documentTitle="Collector View"
              onLoadingChange={setViewLoading}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
          Select a collector to load the ledger view.
        </div>
      )}
    </div>
  );
}
