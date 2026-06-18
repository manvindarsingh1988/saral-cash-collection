import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";
import { getWorkflows } from "../../lib/ledgerRuleEngine";

const fieldLabels = {
  Id: "Id",
  TransactionType: "Transaction Type",
  CollectorId: "Collector",
  ToCollector: "To Collector Id",
  ToCollectorName: "To Collector",
  Amount: "Amount (Rs)",
  Date: "Transaction Date",
  Comment: "Comment",
  CollectorName: "Collector Name",
  CashierName: "Cashier Name",
  RetailerName: "Retailer Name",
};

const allowedFields = [
  "Id",
  "TransactionType",
  "CollectorId",
  "WorkFlow",
  "Amount",
  "Date",
  "Comment",
  "RetailerId",
  "CollectorName",
  "ToCollector",
  "ToCollectorName",
  "RetailerName",
  "CashierId",
  "CashierName",
  "DocId",
  "GivenOn",
  "TransactionId",
];

export default function ApprovalLedgerModal({
  masterData,
  onClose,
  onSubmit,
  initialData,
}) {
  const userType = apiBase.getCurrentUser()?.UserType;
  const workflows = getWorkflows(userType);

  const [formData, setFormData] = useState({
    CollectorId: "",
    ToCollector: "",
    ToCollectorName: "",
    Amount: "",
    TransactionType: "1",
    WorkFlow: "",
    Date: new Date(),
    GivenOn: new Date(),
    Comment: "",
    DocId: null,
    CashierId: null,
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {};
      allowedFields.forEach((field) => {
        if (initialData[field] !== undefined && initialData[field] !== null) {
          formattedData[field] = initialData[field];
        }
      });

      setFormData((prev) => ({ ...prev, ...formattedData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const filteredData = allowedFields.reduce((obj, key) => {
      obj[key] = formData[key];
      return obj;
    }, {});

    if (
      filteredData.WorkFlow === "5" &&
      filteredData.TransactionType != "1" &&
      filteredData.TransactionType != "5"
    ) {
      if (
        filteredData.TransactionId === null ||
        filteredData.TransactionId === undefined ||
        filteredData.TransactionId === ""
      ) {
        alert("TransactionId is mandatory");
        return;
      }
    }

    onSubmit(filteredData);
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm">
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">Approve Ledger</h2>
            <p className="app-modal-subtitle">
              Review the submitted details and update workflow if needed.
            </p>
          </div>
          <button onClick={onClose} className="app-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
          <div className="app-modal-form">
        {allowedFields.map((key) => {
          const alwaysExcludeKeys = [
            "CollectorId",
            "RetailerId",
            "Date",
            "DocId",
            "GivenOn",
            "CashierId",
            "ToCollector",
          ];
          const conditionalExcludeKeys = [
            "CollectorName",
            "ToCollectorName",
            "RetailerName",
            "Id",
            "CashierName",
          ];

          if (
            alwaysExcludeKeys.includes(key) ||
            (conditionalExcludeKeys.includes(key) && !formData[key])
          ) {
            return null;
          }
          if (key === "TransactionId" && formData.TransactionType === 1) {
            return null;
          }

          const label = fieldLabels[key] || key;
          let inputElement;

          if (key === "TransactionType" || key === "WorkFlow") {
            inputElement = (
              <>
                <select
                  disabled={key !== "WorkFlow"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded-lg"
                >
                  <option value="" disabled hidden>
                    Select {key} Type
                  </option>
                  {masterData?.[key + "s"]
                    ?.filter((t) => {
                      if (key === "WorkFlow") {
                        return workflows.includes(t.Id);
                      }
                      return true;
                    })
                    .map((type) => (
                      <option key={type.Id} value={type.Id}>
                        {type.Description}
                      </option>
                    ))}
                </select>
                {key === "TransactionType" &&
                  formData.TransactionType === "2" && (
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Note:</strong> Please mention transaction details
                      in comment to avoid rejection.
                    </p>
                  )}
              </>
            );
          } else {
            const inputType = ["Amount", "WorkFlow", "Id"].includes(key)
              ? "number"
              : ["Date"].includes(key)
              ? "date"
              : "text";

            inputElement = (
              <input
                readOnly={key !== "WorkFlow" && key !== "TransactionId"}
                disabled={key !== "WorkFlow" && key !== "TransactionId"}
                name={key}
                type={inputType}
                value={formData[key] ?? ""}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg"
              />
            );
          }

          return (
            <div key={key} className="app-modal-field">
              <label className="app-modal-label">{label}</label>
              {inputElement}
            </div>
          );
        })}

        <div className="app-modal-field">
          {formData?.DocId && (
            <button
              onClick={async () => {
                try {
                  const blob = await apiBase.downloadFileUrl(formData.DocId);

                  if (!blob || blob.size === 0) {
                    alert("No file found for this entry.");
                    return;
                  }

                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("File download failed:", err);
                  alert("Failed to download file.");
                }
              }}
              className="text-blue-600 text-sm mb-1 hover:underline text-left"
            >
              Download File
            </button>
          )}
        </div>
        </div>
        </div>
        <div className="app-modal-actions">
          <button onClick={onClose} className="app-button-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="app-button-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
