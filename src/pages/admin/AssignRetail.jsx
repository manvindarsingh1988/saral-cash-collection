import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
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

      {/* Source Collector Select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Select Source Collector
        </label>
        <select
          className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm mt-1"
          value={selectedCollector?.Id || ""}
          onChange={(e) => handleCollectorSelect(e.target.value)}
        >
          <option value="">Select collector</option>
          {collectors.map((c) => (
            <option key={c.Id} value={c.Id}>
              {c.UserName}
            </option>
          ))}
        </select>
      </div>

      {/* Target Collector and Shift Panel */}
      {selectedCollector && (
        <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
          <h3 className="text-md font-semibold text-indigo-700 mb-2">
            Shift All Retailers to Another Collector
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Target Collector
              </label>
              <select
                className="w-full px-3 py-2 border border-indigo-300 rounded-md shadow-sm mt-1"
                value={newCollectorId}
                onChange={(e) => setNewCollectorId(e.target.value)}
              >
                <option value="">Select collector</option>
                {collectors
                  .filter((c) => c.Id !== selectedCollector?.Id)
                  .map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.UserName}
                    </option>
                  ))}
              </select>
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
      {selectedCollector && (
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
