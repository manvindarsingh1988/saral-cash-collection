import React, { useEffect, useMemo, useState } from "react";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";

const columns = [
  { key: "Id", label: "ID", width: "120px" },
  { key: "QRId", label: "QR ID", width: "220px" },
  { key: "UserId", label: "User ID", width: "220px" },
  { key: "Action", label: "Action", width: "140px", isAction: true },
];

export default function UserQRMapping() {
  useDocumentTitle("QR and User Mapping");

  const [qrId, setQrId] = useState("");
  const [userId, setUserId] = useState("");
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "Id", direction: "desc" });

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

  const sortedMappings = useMemo(
    () => sortTableRows(mappings, sortConfig),
    [mappings, sortConfig]
  );

  const resetForm = () => {
    setQrId("");
    setUserId("");
  };

  const onSort = (key) => {
    if (key === "Action") return;
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
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
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="rounded-lg bg-white p-4 shadow sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">QR and User Mapping</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">QR ID</label>
            <input
              type="text"
              value={qrId}
              onChange={(e) => setQrId(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Enter QR ID"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Enter User ID"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddMapping}
              disabled={submitting}
              className="w-full rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60 md:w-auto"
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

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
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
          <div className="app-table-shell min-h-0 flex-1 overflow-auto">
            <table className="app-table min-w-full table-auto text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-left">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-2 font-semibold"
                      style={{
                        width: column.width,
                        minWidth: column.width,
                        maxWidth: column.width,
                      }}
                    >
                      {column.isAction ? (
                        <span>{column.label}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className="flex items-center gap-1 text-left"
                        >
                          <span>{column.label}</span>
                          <span className="text-[10px] text-slate-400">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMappings.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                      No mappings found.
                    </td>
                  </tr>
                ) : (
                  sortedMappings.map((item) => (
                    <tr key={item.Id}>
                      <td className="px-4 py-3">
                        <TruncatedCell>{item.Id}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3">
                        <TruncatedCell>{item.QRId}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3">
                        <TruncatedCell>{item.UserId}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3">
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
