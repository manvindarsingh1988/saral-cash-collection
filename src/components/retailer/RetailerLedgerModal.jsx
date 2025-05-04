import React, { useState, useEffect } from "react";

const allowedFields = [
  "TransactionType",
  "CollectorId",
  "Amount",
  "Date",
  "Comment",
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
    TransactionType: "",
    WorkFlow: "",
    Date: "",
    Comment: "",
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {};

      allowedFields.forEach((field) => {
        if (initialData[field]) {
          if (["Date"].includes(field)) {
            formattedData[field] = new Date(initialData[field])
              .toISOString()
              .split("T")[0];
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">
          {!initialData ? "Add" : "Update"} Ledger Entry
        </h2>
        {allowedFields.map((key) => {
          console.log("Key:", key, "Value:", formData[key]);

          if (formData["TransactionType"] === "2" && key === "CollectorId") {
            return null;
          }

          const label = key.replace(/([A-Z])/g, " $1").trim();
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
                  formData["TransactionType"] === "2" && (
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Note:</strong> Please mention transaction details
                      in comment to avoid rejection.
                    </p>
                  )}
              </>
            );
          } else {
            const inputType = ["Amount", "WorkFlow"].includes(key)
              ? "number"
              : ["Date"].includes(key)
              ? "date"
              : "text";

            inputElement = (
              <input
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
