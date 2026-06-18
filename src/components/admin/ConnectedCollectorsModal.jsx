import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";

export default function ConnectedCollectorsModal({
  setShowModal,
  selectedUserId,
}) {

  const [connectedCollectors, setConnectedCollectors] = useState([]);

  useEffect(() => {
    // Fetch connected collectors from the API
    const fetchConnectedCollectors = async () => {
      try {
        const result = await apiBase.getLinkedCollectors(selectedUserId);
        console.log("Connected Collectors:", result);
        setConnectedCollectors(result || []);
      } catch (err) {
        console.error("Failed to fetch connected collectors", err);
        setConnectedCollectors([]);
      }
    };
    if (selectedUserId) {
      fetchConnectedCollectors();
    }
  }, [selectedUserId]);

  if (!selectedUserId) {
    return null;
  }

  return (
    <div className="app-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="app-modal app-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <div>
            <h3 className="app-modal-title">Connected Collectors</h3>
            <p className="app-modal-subtitle">User ID: {selectedUserId}</p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
        {connectedCollectors?.length === 0 ? (
          <p className="text-sm text-slate-500">No collectors found.</p>
        ) : (
          <div
            className="grid grid-cols-1 gap-3"
          >
            {connectedCollectors.map((collector) => (
              <div
                key={collector.CollectorUserId}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <strong className="block text-slate-800">{collector.CollectorUser}</strong>
                <span className="text-sm text-slate-500">
                  ID: {collector.CollectorUserId}
                </span>
              </div>
            ))}
          </div>
        )}
        </div>
        <div className="app-modal-actions">
          <button onClick={() => setShowModal(false)} className="app-button-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
