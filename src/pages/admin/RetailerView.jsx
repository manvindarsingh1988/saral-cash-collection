import React, { useEffect, useState } from "react";
import SearchableSelect from "../../components/SearchableSelect";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import RetailDashboard from "../dashboards/RetailDashboard";

export default function RetailerView() {
  useDocumentTitle("Retailer View");

  const [retailers, setRetailers] = useState([]);
  const [selectedRetailerId, setSelectedRetailerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiBase.getRetailUsers();
        setRetailers(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load retailers.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetailers();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      <div className="shrink-0 rounded-lg bg-white p-6 shadow">
        <div className="flex flex-col gap-3 sm:max-w-2xl">
          <label className="text-base font-semibold text-gray-700">
            Select Retailer
          </label>
          <SearchableSelect
            value={selectedRetailerId}
            onChange={setSelectedRetailerId}
            options={retailers.map((retailer) => ({
              value: retailer.Id,
              label: `${retailer.UserName} (${retailer.Id})`,
            }))}
            placeholder="Select Retailer"
            searchPlaceholder="Search retailer..."
            buttonClassName="min-h-[60px] text-base"
            panelClassName="text-base"
          />
          {loading && <div className="text-sm text-gray-500">Loading retailers...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      {selectedRetailerId ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <RetailDashboard
            key={selectedRetailerId}
            retailUserId={selectedRetailerId}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg bg-white p-10 text-center text-gray-500 shadow">
          Select a retailer to load the retailer view.
        </div>
      )}
    </div>
  );
}
