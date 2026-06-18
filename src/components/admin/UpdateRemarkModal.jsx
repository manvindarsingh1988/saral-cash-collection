import React, { useState } from "react";
import { X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";

export default function UpdateRemarkModal({
  handleRemarkModalClose,
  selectedUserId,
}) {
  const [remark, setRemark] = useState("");

  const handleSave = async () => {
    console.log("Saving for user:", selectedUserId, {
      remark
    });

    const result = await apiBase.updateRemarkData(
      selectedUserId,
      remark
    );
    if (!result?.Response) {
      alert("Failed to update opening balance");
      return;
    }
    handleRemarkModalClose(remark);
  };
  console.log("Selected User ID:", selectedUserId);
  if (!selectedUserId) {
    return "";
  }

  return (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm">
        <div className="app-modal-header">
          <div>
            <h3 className="app-modal-title">Update Remark</h3>
            <p className="app-modal-subtitle">Add or update the user remark.</p>
          </div>
          <button
            onClick={() => handleRemarkModalClose(null, null)}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
        <div className="app-modal-form">
        <div className="app-modal-field">
          <label htmlFor="opening-balance" className="app-modal-label">Id</label>
          <input
            disabled
            type="text"
            id="id"
            value={`${selectedUserId}`}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>

        <div className="app-modal-field">
          <label htmlFor="opening-balance" className="app-modal-label">Remark</label>
          <input
            type="text"
            id="opening-balance"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>
        </div>
        </div>
        <div className="app-modal-actions">
          <button
            onClick={() => handleRemarkModalClose(null, null)}
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
