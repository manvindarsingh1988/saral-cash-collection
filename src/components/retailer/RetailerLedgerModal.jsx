import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import { base64ToByteArray } from "../../lib/utils";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">
          {!initialData ? "Add" : "Update"} Ledger Entry
        </h2>
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
              <select
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              >
                <option value="" disabled hidden>
                  Select Collector
                </option>
                {collectors?.map((collector) => (
                  <option
                    key={collector.CollectorUserId}
                    value={collector.CollectorUserId}
                  >
                    {collector.CollectorUserName}
                  </option>
                ))}
              </select>
            );
          } else if (key === "TransactionType" || key === "WorkFlow") {
            inputElement = (
              <>
                <select
                  disabled={key === "WorkFlow"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                >
                  <option value="" disabled hidden>
                    Select {key} Type
                  </option>
                  {masterData?.[key + "s"]?.map((type) => (
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
                className="border px-2 py-1 rounded"
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
                className="border px-2 py-1 rounded"
              />
            );
          }

          return (
            <div key={key} className="flex flex-col">
              {key !== "StuckInBank" && key !== "StuckInCDM" && (
                <label className="text-sm text-gray-600">{label}</label>
              )}{" "}
              {inputElement}
            </div>
          );
        })}

        {/* File Upload */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Upload Slip</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border px-2 py-1 rounded"
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

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 rounded border">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
