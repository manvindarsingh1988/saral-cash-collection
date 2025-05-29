import React, { useState, useEffect } from "react";

const fieldLabels = {
  Id: "Id",
  TransactionType: "Transaction Type",
  CollectorId: "Collector",
  Amount: "Amount (₹)",
  Date: "Transaction Date",
  Comment: "Comment",
  StuckInBank: "Stuck In Bank",
};

const allowedFields = [
  "Id",
  "TransactionType",
  "CollectorId",
  "Amount",
  "Date",
  "Comment",
  "StuckInBank",
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
        if (field === "StuckInBank") {
          formattedData[field] = initialData["WorkFlow"] === 6;
        }
        if (field === "CollectorId") {
          formattedData[field] = initialData["Id"] || "";
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
            (formData["TransactionType"] == "2" && key === "CollectorId") ||
            (formData["TransactionType"] == "3" && key === "CollectorId") ||
            (formData["TransactionType"] != "2" && key === "StuckInBank") ||
            key == "Date"
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
                  (formData["TransactionType"] === "2" ||
                    formData["TransactionType"] === "3") && (
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
              {key !== "StuckInBank" && (
                <label className="text-sm text-gray-600">{label}</label>
              )}{" "}
              {inputElement}
            </div>
          );
        })}

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
