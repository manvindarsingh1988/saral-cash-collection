import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import SearchableSelect from "../../components/SearchableSelect";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function AssignRetail() {
  useDocumentTitle("Assign Retail Users to Collectors");

  const [retailers, setRetailers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [newCollectorId, setNewCollectorId] = useState("");
  const [mappedRetailers, setMappedRetailers] = useState([]);
  const [selectedMappedRetailers, setSelectedMappedRetailers] = useState([]);
  const [unassignedRetailers, setUnassignedRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [assignByMarketLocation, setAssignByMarketLocation] = useState(false);
  const [marketLocations, setMarketLocations] = useState([]);
  const [selectedMarketLocationId, setSelectedMarketLocationId] = useState("");
  const [marketLocationCollectorId, setMarketLocationCollectorId] = useState("");
  const [replaceExistingMapping, setReplaceExistingMapping] = useState(false);
  const [marketMoveLoading, setMarketMoveLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!assignByMarketLocation) return;
    apiBase.getMarketLocations()
      .then((data) => setMarketLocations(Array.isArray(data) ? data : data?.Data || []))
      .catch((err) => setError(err.message || "Unable to load market locations."));
  }, [assignByMarketLocation]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [retailData, collectorData] = await Promise.all([
        apiBase.getRetailUsers(),
        apiBase.getCollectors(),
      ]);

      setRetailers(retailData);
      setCollectors(collectorData);

      if (!selectedCollector) {
        setUnassignedRetailers(
          retailData.filter((r) => !r.assignedCollectorId)
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectorSelect = async (collectorId) => {
    const collector = collectors.find((c) => c.Id === collectorId);
    setSelectedCollector(collector);

    const mappedRetailData = await apiBase.getMappedUsersByCollectorId(
      collector.Id
    );

    setMappedRetailers(mappedRetailData);
    setSelectedMappedRetailers(mappedRetailData);
    setUnassignedRetailers(
      retailers.filter(
        (r) => !mappedRetailData.some((mr) => mr.RetailerUserId === r.Id)
      )
    );
  };

  const handleAssign = async (retailerId) => {
    try {
      setError(null);
      const result = await apiBase.alignCollectorWithRetailerUser({
        RetailerId: retailerId,
        CollectorId: selectedCollector.Id,
      });
      if (!result.Response) {
        alert(`Failed to assign retailer`);
        return;
      }
      if (result.Response?.startsWith("Errors:")) {
          alert(result.Response); 
          return;
      } 
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchUsers();
      handleCollectorSelect(selectedCollector.Id);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUnassign = async (retailerId) => {
    try {
      setError(null);
      const result = await apiBase.deleteLinking(
        selectedCollector.Id,
        retailerId
      );
      if (!result.Response) {
        alert(`Failed to unassign retailer`);
        return;
      }      
      if (result.Response === "Can not delete the mapping as Collectaor and Retailer have active ledger(s).") {
        alert(result.Response);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchUsers();
      handleCollectorSelect(selectedCollector.Id);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleShiftAllRetailers = async () => {
    if (
      !selectedCollector ||
      !newCollectorId ||
      selectedCollector.Id === newCollectorId
    ) {
      setError("Please select different source and target collectors.");
      return;
    }

    try {
      setError(null);
      const result = await apiBase.linkAllRetailersToNewCollector(
        selectedCollector.Id,
        newCollectorId
      );

      if (!result.Response) {
        alert(`Failed to shift retailers`);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchUsers();
      setSelectedCollector(null);
      setNewCollectorId("");
    } catch (error) {
      setError(error.message);
    }
  };

  const getMarketLocationId = (location) => location?.Id ?? location?.id ?? location?.MarketLocationId ?? location?.marketLocationId;
  const getMarketLocationName = (location) => location?.Name ?? location?.name ?? location?.MarketLocation ?? location?.marketLocation ?? "";

  const handleMoveByMarketLocation = async () => {
    if (!selectedMarketLocationId || !marketLocationCollectorId) {
      setError("Select a market location and target collector.");
      return;
    }
    try {
      setMarketMoveLoading(true);
      setError(null);
      const result = await apiBase.moveRetailersByMarketLocation(selectedMarketLocationId, marketLocationCollectorId, replaceExistingMapping);
      if (result?.Response === false || result?.success === false) throw new Error(result?.Message || "Failed to move retailers.");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSelectedMarketLocationId("");
      setMarketLocationCollectorId("");
      setReplaceExistingMapping(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to move retailers by market location.");
    } finally {
      setMarketMoveLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-8xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          Operation completed successfully!
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Assignment mode</div>
          <div className="text-xs text-slate-500">Switch on to move all retailers from one market location to a collector.</div>
        </div>
        <fieldset className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <legend className="sr-only">Assignment mode</legend>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="assignmentMode"
              checked={!assignByMarketLocation}
              onChange={() => {
                setAssignByMarketLocation(false);
                setSelectedMarketLocationId("");
                setMarketLocationCollectorId("");
              }}
              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Standard
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="assignmentMode"
              checked={assignByMarketLocation}
              onChange={() => setAssignByMarketLocation(true)}
              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Assign By MarketLoc
          </label>
        </fieldset>
      </div>

      {assignByMarketLocation ? (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-blue-900">Move Retailers By Market Location</h2>
            <p className="mt-1 text-sm text-blue-700/80">Choose a market location and the collector who should receive all retailers mapped to it.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Market Location</label>
              <SearchableSelect
                value={selectedMarketLocationId}
                onChange={setSelectedMarketLocationId}
                options={marketLocations.map((location) => ({ value: getMarketLocationId(location), label: getMarketLocationName(location) }))}
                placeholder="Select market location"
                searchPlaceholder="Search market location..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Target Collector</label>
              <SearchableSelect
                value={marketLocationCollectorId}
                onChange={setMarketLocationCollectorId}
                options={collectors.map((collector) => ({ value: collector.Id, label: `${collector.UserName} (${collector.Id})` }))}
                placeholder="Select collector"
                searchPlaceholder="Search collector..."
              />
            </div>
            <button
              type="button"
              onClick={handleMoveByMarketLocation}
              disabled={marketMoveLoading || !selectedMarketLocationId || !marketLocationCollectorId}
              className="app-button-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              {marketMoveLoading ? "Moving..." : "Move Retailers"}
            </button>
            <label className="flex items-center gap-2 self-center text-sm font-medium text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={replaceExistingMapping}
                onChange={(event) => setReplaceExistingMapping(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Replace existing retailer mapping before assigning
            </label>
          </div>
        </div>
      ) : null}

      {/* Source Collector Select */}
      {!assignByMarketLocation && <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Select Source Collector
        </label>
        <SearchableSelect
          className="mt-1"
          value={selectedCollector?.Id || ""}
          onChange={handleCollectorSelect}
          options={collectors.map((c) => ({
            value: c.Id,
            label: `${c.UserName} (${c.Id})`,
          }))}
          placeholder="Select collector"
          searchPlaceholder="Search collector..."
        />
      </div>}

      {/* Target Collector and Shift Panel */}
      {!assignByMarketLocation && selectedCollector && (
        <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
          <h3 className="text-md font-semibold text-indigo-700 mb-2">
            Shift All Retailers to Another Collector
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Target Collector
              </label>
              <SearchableSelect
                className="mt-1"
                value={newCollectorId}
                onChange={setNewCollectorId}
                options={collectors
                  .filter((c) => c.Id !== selectedCollector?.Id)
                  .map((c) => ({
                    value: c.Id,
                    label: `${c.UserName} (${c.Id})`,
                  }))}
                placeholder="Select collector"
                searchPlaceholder="Search collector..."
              />
            </div>

            <div className="flex items-end">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleShiftAllRetailers}
                disabled={!newCollectorId}
              >
                Shift All Retailers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retailers Panel */}
      {!assignByMarketLocation && selectedCollector && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Assigned Retailers */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Assigned Retailers
            </h2>
            <input
              type="text"
              placeholder="Search assigned retailer..."
              className="mt-4 mb-4 block w-full border px-4 py-2 rounded-md shadow-sm"
              onChange={(e) => {
                const filtered = mappedRetailers.filter((r) =>
                  r.RetailerUserName.toLowerCase().includes(
                    e.target.value.toLowerCase()
                  )
                );
                setSelectedMappedRetailers(filtered);
              }}
            />
            <div className="overflow-y-auto max-h-[400px] border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedMappedRetailers.map((r) => (
                    <tr key={r.RetailerId}>
                      <td className="px-4 py-2">{r.RetailerUserName}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleUnassign(r.RetailerUserId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedMappedRetailers.length === 0 && (
                    <tr>
                      <td
                        colSpan="2"
                        className="text-center py-4 text-sm text-gray-500"
                      >
                        No assigned retailers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unassigned Retailers */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Available Retailers
            </h2>
            <input
              type="text"
              placeholder="Search retailer..."
              className="mt-4 mb-4 block w-full border px-4 py-2 rounded-md shadow-sm"
              onChange={(e) =>
                setUnassignedRetailers(
                  retailers.filter((r) =>
                    r.UserName.toLowerCase().includes(
                      e.target.value.toLowerCase()
                    )
                  )
                )
              }
            />
            <div className="overflow-y-auto max-h-[400px] border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unassignedRetailers.map((r) => (
                    <tr key={r.Id}>
                      <td className="px-4 py-2">{r.UserName}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleAssign(r.Id)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                  {unassignedRetailers.length === 0 && (
                    <tr>
                      <td
                        colSpan="2"
                        className="text-center py-4 text-sm text-gray-500"
                      >
                        No retailers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
