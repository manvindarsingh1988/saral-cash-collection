import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function UserQRMapping() {
  useDocumentTitle("QR and User Mapping");

  const [qrId, setQrId] = useState("");
  const [userId, setUserId] = useState("");
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const response = await apiBase.getUserQRMappings();
      setMappings(Array.isArray(response) ? response : []);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to load QR mappings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMappings();
  }, []);

  const resetForm = () => {
    setQrId("");
    setUserId("");
  };

  const handleAddMapping = async () => {
    if (!qrId.trim() || !userId.trim()) {
      setIsError(true);
      setMessage("QR ID and User ID are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiBase.insertUserQRMapping(qrId.trim(), userId.trim());
      const serverMessage = response?.Response || "Success: Mapping added successfully.";
      setIsError(serverMessage.includes("Errors:"));
      setMessage(serverMessage);

      if (!serverMessage.includes("Errors:")) {
        resetForm();
        await loadMappings();
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to add mapping.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMapping = async (mappingQrId) => {
    if (!window.confirm(`Delete mapping for QR ID ${mappingQrId}?`)) {
      return;
    }

    try {
      const response = await apiBase.deleteUserQRMapping(mappingQrId);
      const serverMessage = response?.Response || "Success: Mapping deleted successfully.";
      setIsError(serverMessage.includes("Errors:"));
      setMessage(serverMessage);

      if (!serverMessage.includes("Errors:")) {
        setMappings((prev) => prev.filter((item) => item.QRId !== mappingQrId));
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to delete mapping.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">QR and User Mapping</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR ID</label>
            <input
              type="text"
              value={qrId}
              onChange={(e) => setQrId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter QR ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="Enter User ID"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddMapping}
              disabled={submitting}
              className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Mapping"}
            </button>
          </div>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Existing Mappings</h3>
          <button
            type="button"
            onClick={loadMappings}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading mappings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm border border-gray-200 rounded-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 font-semibold">Id</th>
                  <th className="p-2 font-semibold">QR ID</th>
                  <th className="p-2 font-semibold">User ID</th>
                  <th className="p-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No mappings found.
                    </td>
                  </tr>
                ) : (
                  mappings.map((item) => (
                    <tr key={item.Id} className="border-t border-gray-200 even:bg-gray-50">
                      <td className="p-2">{item.Id}</td>
                      <td className="p-2">{item.QRId}</td>
                      <td className="p-2">{item.UserId}</td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteMapping(item.QRId)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
