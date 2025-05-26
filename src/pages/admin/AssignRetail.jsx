import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function AssignRetail() {
  useDocumentTitle("Assign Retail Users to Collectors");
  const [retailers, setRetailers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [unassignedRetailers, setUnassignedRetailers] = useState([]);
  const [mappedRetailers, setMappedRetailers] = useState([]);
  const [selectedMappedRetailers, setSelectedMappedRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

      // If no collector is selected, reset unassigned retailers
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
    // Update unassigned retailers list
    const mappedRetailData = await apiBase.getMappedUsersByCollectorId(
      collector.Id
    );
    console.log("Mapped Retail Data:", mappedRetailData);
    setMappedRetailers(mappedRetailData);
    setSelectedMappedRetailers(mappedRetailData);
    setUnassignedRetailers(
      retailers.filter(
        (r) => !mappedRetailData.some((mr) => mr.RetailerUserId === r.Id)
      )
    );
    console.log("Unassigned Retailers:", unassignedRetailers);
  };

  const handleAssign = async (retailerId) => {
    try {
      setError(null);
      console.log("Assigning collector:", selectedCollector);
      console.log("Retailer ID:", retailerId);
      await apiBase.alignCollectorWithRetailerUser({
        RetailerId: retailerId,
        CollectorId: selectedCollector.Id,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUnassign = async (retailerId) => {
    try {
      setError(null);
      await apiBase.assignCollector(retailerId, null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 bg-white shadow-md rounded-lg">
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          Assignment updated successfully!
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="collector"
          className="block text-sm font-medium text-gray-700"
        >
          Select Collector
        </label>
        <select
          id="collector"
          className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedCollector?.Id || ""}
          onChange={(e) => handleCollectorSelect(e.target.value)}
        >
          <option value="">Select a collector</option>
          {collectors.map((collector) => (
            <option key={collector.Id} value={collector.Id}>
              {collector.UserName}
            </option>
          ))}
        </select>
      </div>

      {selectedCollector && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Assigned Retail Users */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Assigned Retail Users
            </h2>

            <input
              type="text"
              placeholder="Search assigned retailer..."
              className="mt-4 mb-4 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              onChange={(e) => {
                const filtered = mappedRetailers.filter((r) =>
                  r.RetailerUserName.toLowerCase().includes(
                    e.target.value.toLowerCase()
                  )
                );
                setSelectedMappedRetailers(filtered);
              }}
            />

            <div className="overflow-y-auto max-h-[400px]">
              <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retailer Name
                      </th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedMappedRetailers?.length > 0 &&
                      selectedMappedRetailers.map((mappedRetailer) => (
                        <tr key={mappedRetailer.RetailerId}>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {mappedRetailer.RetailerUserName}
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            <button
                              onClick={() =>
                                handleUnassign(mappedRetailer.RetailerId)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {selectedMappedRetailers?.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No assigned retailers found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Retail Users */}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Available Retail Users
            </h2>

            <input
              type="text"
              placeholder="Search retailer..."
              className="mt-4 mb-4 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              onChange={(e) =>
                setUnassignedRetailers(
                  retailers.filter((r) =>
                    r.UserName?.toLowerCase().includes(
                      e.target.value?.toLowerCase()
                    )
                  )
                )
              }
            />

            <div className="overflow-y-auto max-h-[400px]">
              <div className="overflow-x-auto rounded-md border border-gray-300 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retailer Name
                      </th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {unassignedRetailers.map((retailer) => (
                      <tr key={retailer.Id}>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {retailer.UserName}
                        </td>
                        <td className="px-4 py-4 text-right text-sm">
                          <button
                            onClick={() => handleAssign(retailer.Id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {unassignedRetailers.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No retailers found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
