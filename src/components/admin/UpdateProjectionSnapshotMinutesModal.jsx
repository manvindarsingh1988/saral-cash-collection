import React, { useState } from "react";
import { X } from "lucide-react";
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
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm">
        <div className="app-modal-header">
          <div>
            <h3 className="app-modal-title">Update Projection Snapshot Minutes</h3>
            <p className="app-modal-subtitle">Define refresh interval for the selected user.</p>
          </div>
          <button
            onClick={() => handleProjectionSnapshotMinutesModalClose(undefined)}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
        <div className="app-modal-form">
        <div className="app-modal-field">
          <label htmlFor="projection-snapshot-user-id" className="app-modal-label">Id</label>
          <input
            disabled
            type="text"
            id="projection-snapshot-user-id"
            value={`${selectedUserId}`}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>

        <div className="app-modal-field">
          <label htmlFor="projection-snapshot-minutes" className="app-modal-label">Minutes</label>
          <input
            type="number"
            id="projection-snapshot-minutes"
            min="1"
            value={projectionSnapshotMinutes}
            onChange={(e) => setProjectionSnapshotMinutes(e.target.value)}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>
        </div>
        </div>
        <div className="app-modal-actions">
          <button
            onClick={() => handleProjectionSnapshotMinutesModalClose(undefined)}
            className="app-button-secondary"
          >
            Close
          </button>
          <button onClick={handleSave} className="app-button-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
