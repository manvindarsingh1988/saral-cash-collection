import React, { useState } from "react";
import { apiBase } from "../../lib/apiBase";

export default function UpdateProjectionSnapshotMinutesModal({
  handleProjectionSnapshotMinutesModalClose,
  selectedUserId,
  initialMinutes,
}) {
  const [projectionSnapshotMinutes, setProjectionSnapshotMinutes] = useState(
    initialMinutes ?? ""
  );

  const handleSave = async () => {
    const normalizedValue =
      projectionSnapshotMinutes === "" || projectionSnapshotMinutes === null
        ? null
        : Number(projectionSnapshotMinutes);

    if (normalizedValue !== null && (!Number.isInteger(normalizedValue) || normalizedValue < 1)) {
      alert("Please enter a valid minute value greater than 0.");
      return;
    }

    const result = await apiBase.updateProjectionSnapshotMinutes(
      selectedUserId,
      normalizedValue
    );

    if (!result?.Response) {
      alert("Failed to update projection snapshot minutes");
      return;
    }

    handleProjectionSnapshotMinutesModalClose(normalizedValue);
  };

  if (!selectedUserId) {
    return "";
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "400px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>Update Projection Snapshot Minutes</h3>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="projection-snapshot-user-id">Id</label>
          <input
            disabled
            type="text"
            id="projection-snapshot-user-id"
            value={`${selectedUserId}`}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            className="date-picker border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="projection-snapshot-minutes">Minutes</label>
          <input
            type="number"
            id="projection-snapshot-minutes"
            min="1"
            value={projectionSnapshotMinutes}
            onChange={(e) => setProjectionSnapshotMinutes(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            className="date-picker border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <button
            onClick={() => handleProjectionSnapshotMinutesModalClose(undefined)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
