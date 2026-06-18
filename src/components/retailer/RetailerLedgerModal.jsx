import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";
import { handleDownloadFile } from "../../lib/utils";
import SearchableSelect from "../SearchableSelect";

const fieldLabels = {
  Id: "Id",
  TransactionType: "Transaction Type",
  CollectorId: "Collector",
  Amount: "Amount (₹)",
  Date: "Transaction Date",
  Comment: "Comment",
  StuckInBank: "Stuck In Bank",
  StuckInCDM: "Stuck In CDM",
};

const allowedFields = [
  "Id",
  "TransactionType",
  "CollectorId",
  "Amount",
  "Date",
  "Comment",
  "StuckInBank",
  "StuckInCDM",
  "File",
  "DocId",
];

export default function RetailerLedgerModal({
  collectors,
  masterData,
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  console.log("Initial Data:", initialData);

  const [formData, setFormData] = useState({
    CollectorId: "",
    Amount: "",
    TransactionType: "1",
    WorkFlow: "",
    Date: new Date(),
    Comment: "",
    StuckInBank: false,
    StuckInCDM: false,
    File: [],
    DocId: null,
  });

  console.log("Form Data:", formData);

  useEffect(() => {
    if (initialData) {
      const formattedData = {};
      console.log("Formatting initial data:", initialData);
      console.log("Allowed Fields:", allowedFields);
      allowedFields.forEach((field) => {
        if (initialData[field]) {
          if (["Date"].includes(field)) {
            formattedData[field] = initialData[field].split("T")[0];
          } else {
            formattedData[field] = initialData[field];
          }
        }
        if (field === "StuckInBank") {
          formattedData[field] = initialData["WorkFlow"] === 6;
        }
        if (field === "StuckInCDM") {
          formattedData[field] = initialData["WorkFlow"] === 8;
        }
        if (field === "CollectorId") {
          formattedData[field] = initialData[field] || "";
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
    if (formData.TransactionType === "1" && !formData.CollectorId) {
      alert("Select valid collector");
      return;
    }
    const filteredData = allowedFields.reduce((obj, key) => {
      obj[key] = formData[key];
      return obj;
    }, {});
    onSubmit(filteredData);
    onClose();
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, File: Array.from(e.target.files) }));
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm">
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">
              {!initialData ? "Add" : "Update"} Ledger Entry
            </h2>
            <p className="app-modal-subtitle">Add retailer ledger details and supporting slip.</p>
          </div>
          <button onClick={onClose} className="app-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
          <div className="app-modal-form">
        {allowedFields.map((key) => {
          console.log("Key:", key, "Value:", formData[key]);

          if (
            (formData["TransactionType"] == "" && key === "CollectorId") ||
            (formData["TransactionType"] !== "1" && key === "CollectorId") ||
            (formData["TransactionType"] != "2" && key === "StuckInBank") ||
            (formData["TransactionType"] != "6" && key === "StuckInCDM") ||
            key == "Date" ||
            key === "DocId" ||
            key === "File"
          ) {
            console.log(`Skipping field ${key} due to conditions`);
            return null;
          }

          if (key === "Id" && !formData["Id"]) {
            return null;
          }

          const label = fieldLabels[key] || key;
          let inputElement;

          if (key === "CollectorId") {
            inputElement = (
              <SearchableSelect
                value={formData[key]}
                onChange={(value) =>
                  handleChange({ target: { name: key, value } })
                }
                options={(collectors || []).map((collector) => ({
                  value: collector.CollectorUserId,
                  label: `${collector.CollectorUserName} (${collector.CollectorUserId})`,
                }))}
                placeholder="Select Collector"
                searchPlaceholder="Search collector..."
              />
            );
          } else if (key === "TransactionType" || key === "WorkFlow") {
            inputElement = (
              <>
                <select
                  disabled={key === "WorkFlow"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded-lg"
                >
                  <option value="" disabled hidden>
                    Select {key} Type
                  </option>
                  {masterData?.[key + "s"]?.filter(type => type.Description?.toLowerCase() !== "upi")?.map((type) => (
                    <option key={type.Id} value={type.Id}>
                      {type.Description}
                    </option>
                  ))}
                </select>
                {key === "TransactionType" &&
                  formData["TransactionType"] != "1"  && (
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Note:</strong> Please mention transaction details
                      in comment to avoid rejection.
                    </p>
                  )}
              </>
            );
          } else if (
            key === "StuckInBank" &&
            formData["TransactionType"] == "2"
          ) {
            console.log("Rendering StuckInBank checkbox");
            inputElement = (
              <label className="flex items-center gap-2">
                <input
                  name={key}
                  type="checkbox"
                  checked={formData[key] ?? false}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: key,
                        value: e.target.checked ? true : false,
                      },
                    })
                  }
                  className="border rounded"
                />
                {fieldLabels[key]}
              </label>
            );
          } else if (
            key === "StuckInCDM" &&
            formData["TransactionType"] == "6"
          ) {
            console.log("Rendering StuckInCDM checkbox");
            inputElement = (
              <label className="flex items-center gap-2">
                <input
                  name={key}
                  type="checkbox"
                  checked={formData[key] ?? false}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: key,
                        value: e.target.checked ? true : false,
                      },
                    })
                  }
                  className="border rounded"
                />
                {fieldLabels[key]}
              </label>
            );
          } else if (key === "Comment") {
            inputElement = (
              <textarea
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg"
              />
            );
          } else {
            const inputType = ["Amount", "WorkFlow", "Id"].includes(key)
              ? "number"
              : ["Date"].includes(key)
              ? "date"
              : "text";

            inputElement = (
              <input
                readOnly={key === "Id"}
                disabled={key === "Id"}
                name={key}
                type={inputType}
                value={formData[key]}
                onChange={handleChange}
                className="border px-3 py-2 rounded-lg"
              />
            );
          }

          return (
            <div key={key} className="app-modal-field">
              {key !== "StuckInBank" && key !== "StuckInCDM" && (
                <label className="app-modal-label">{label}</label>
              )}{" "}
              {inputElement}
            </div>
          );
        })}

        <div className="app-modal-field">
          <label className="app-modal-label">Upload Slip</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border px-3 py-2 rounded-lg"
          />
          {formData?.DocId && (
            <button
              onClick={() => handleDownloadFile(formData.DocId, formData.Id)}
              className="text-blue-600 text-sm mb-1 hover:underline text-left"
            >
              Download Existing File
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
