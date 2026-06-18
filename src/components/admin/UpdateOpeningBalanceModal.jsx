import React, { useState } from "react";
import { X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";

export default function UpdateOpeningBalanceModal({
  handleOpeningBalanceModalClose,
  selectedUserId,
}) {
  const [openingBalance, setOpeningBalance] = useState("");
  const [openingBalanceDate, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSave = async () => {
    console.log("Saving for user:", selectedUserId, {
      openingBalance,
      openingBalanceDate,
    });

    const result = await apiBase.updateOpeningBalanceData(
      selectedUserId,
      openingBalance,
      openingBalanceDate
    );
    if (!result?.Response) {
      alert("Failed to update opening balance");
      return;
    }
    handleOpeningBalanceModalClose(openingBalance, openingBalanceDate);
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
            <h3 className="app-modal-title">Update Opening Balance</h3>
            <p className="app-modal-subtitle">Set opening balance for selected user.</p>
          </div>
          <button
            onClick={() => handleOpeningBalanceModalClose(null, null)}
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
          <label htmlFor="opening-balance" className="app-modal-label">Opening Balance</label>
          <input
            type="number"
            id="opening-balance"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>

        <div className="app-modal-field">
          <label htmlFor="date" className="app-modal-label">Date</label>
          <input
            type="date"
            id="date"
            value={openingBalanceDate}
            onChange={(e) => setDate(e.target.value)}
            className="date-picker border px-3 py-2 rounded-lg shadow-sm"
          />
        </div>
        </div>
        </div>
        <div className="app-modal-actions">
          <button
            onClick={() => handleOpeningBalanceModalClose(null, null)}
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
