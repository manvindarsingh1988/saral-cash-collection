import React, { useEffect, useState } from "react";
import { apiBase } from "../../lib/apiBase";

export default function ConnectedCollectorsModal({
  setShowModal,
  selectedUserId,
}) {
  console.log("Selected User ID:", selectedUserId);
  console.log("Show Modal:", setShowModal);
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
      onClick={() => setShowModal(false)}
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
        <h3 style={{ marginBottom: "1rem" }}>
          Connected Collectors for ID: {selectedUserId}
        </h3>
        {connectedCollectors?.length === 0 ? (
          <p>No collectors found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
              padding: "0",
              listStyleType: "none",
            }}
          >
            {connectedCollectors.map((collector) => (
              <div
                key={collector.CollectorUserId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  padding: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <strong>{collector.CollectorUser}</strong>
                <br />
                ID: {collector.CollectorUserId}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowModal(false)}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
