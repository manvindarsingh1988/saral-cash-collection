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
];

export default function ApprovalLedgerModal({
  masterData,
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
    Date: new Date().toISOString().split("T")[0],
    Comment: "",
    DocId: null,
  });

  console.log("Form Data:", formData);

  useEffect(() => {
    if (initialData) {
      const formattedData = {};
      allowedFields.forEach((field) => {
        if (initialData[field]) {
          if (["Date"].includes(field)) {
            formattedData[field] = initialData[field].split("T")[0];
          } else {
            formattedData[field] = initialData[field];
          }
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

          if (
            key === "CollectorId" ||
            key === "RetailerId" ||
            key === "Date" ||
            (key === "CollectorName" && !formData["CollectorName"]) ||
            (key === "RetailerName" && !formData["RetailerName"]) ||
            key === "DocId"
          ) {
            return null;
          }

          if (key === "Id" && !formData["Id"]) {
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
                  {masterData?.[key + "s"]?.map((type) => {
                    if (
                      key === "WorkFlow" &&
                      type.Id !== 1 &&
                      type.Id !== 4 &&
                      type.Id !== 5
                    )
                      return null;

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
