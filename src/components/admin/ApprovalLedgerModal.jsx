import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import { base64ToByteArray } from "../../lib/utils";
import { getWorkflows } from "../../lib/ledgerRuleEngine";

const fieldLabels = {
  Id: "Id",
  TransactionType: "Transaction Type",
  CollectorId: "Collector",
  Amount: "Amount (₹)",
  Date: "Transaction Date",
  Comment: "Comment",
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
  "RetailerName",
  "DocId",
  "GivenOn",
];

export default function ApprovalLedgerModal({
  masterData,
  onClose,
  onSubmit,
  initialData,
}) {
  console.log("Initial Data:", initialData);

  const userType = apiBase.getCurrentUser()?.UserType;
  const workflows = getWorkflows(userType);

  const [formData, setFormData] = useState({
    CollectorId: "",
    Amount: "",
    TransactionType: "1",
    WorkFlow: "",
    Date: new Date(),
    GivenOn: new Date(),
    Comment: "",
    DocId: null,
  });

  console.log("Form Data:", formData);

  useEffect(() => {
    if (initialData) {
      const formattedData = {};
      allowedFields.forEach((field) => {
        if (initialData[field]) {
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
    onSubmit(filteredData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
      style={{ marginTop: "0px" }}
    >
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">Approve Ledger</h2>
        {allowedFields.map((key) => {
          console.log("Key:", key, "Value:", formData[key]);

          const alwaysExcludeKeys = [
            "CollectorId",
            "RetailerId",
            "Date",
            "DocId",
            "GivenOn",
          ];
          const conditionalExcludeKeys = [
            "CollectorName",
            "RetailerName",
            "Id",
          ];

          if (
            alwaysExcludeKeys.includes(key) ||
            (conditionalExcludeKeys.includes(key) && !formData[key])
          ) {
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
                  className="border px-2 py-1 rounded"
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
                    .map((type) => {
                      return (
                        <option key={type.Id} value={type.Id}>
                          {type.Description}
                        </option>
                      );
                    })}
                </select>
                {key === "TransactionType" &&
                  formData["TransactionType"] === "2" && (
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
                readOnly={key !== "WorkFlow"}
                disabled={key !== "WorkFlow"}
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
              <label className="text-sm text-gray-600">{label}</label>
              {inputElement}
            </div>
          );
        })}

        <div className="flex flex-col">
          {formData?.DocId && (
            <button
              onClick={async () => {
                try {
                  const response = await apiBase.downloadFileUrl(
                    formData.DocId
                  );
                  if (!response || !response.content) {
                    alert("No file found for this entry.");
                    return;
                  }
                  const fileBytes = base64ToByteArray(response.content);
                  const blob = new Blob([fileBytes], {
                    type: "application/zip",
                  });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                } catch (err) {
                  console.error("File download failed:", err);
                }
              }}
              className="text-blue-600 text-sm mb-1 hover:underline text-left"
            >
              Download File
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
