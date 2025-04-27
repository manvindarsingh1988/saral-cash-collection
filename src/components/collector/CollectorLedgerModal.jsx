/* eslint-disable */
import React, { useState, useEffect } from "react";

const allowedFields = [
  "TransactionType",
  "CashierId",
  "CollectorId",
  "Amount",
  "WorkFlow",
  "Date",
  "GivenOn",
  "Comment",
];

export default function CollectorLedgerModal({
  collectorId,
  masterData,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  cashiers,
}) {
  const [formData, setFormData] = useState({
    CollectorId: collectorId,
    TransactionType: "",
    CashierId: "",
    Amount: "",
    WorkFlow: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  useEffect(() => {
    if (initialData) {
      const fd = { ...formData };
      allowedFields.forEach((field) => {
        if (field === "CollectorId") {
          fd[field] = collectorId;
        } else if (["Date", "GivenOn"].includes(field) && initialData[field]) {
          fd[field] = new Date(initialData[field]).toISOString().split("T")[0];
        } else if (initialData[field] !== undefined) {
          fd[field] = initialData[field];
        }
      });
      setFormData(fd);
    }
  }, [initialData, collectorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
          if (key === "CollectorId") return null;
          if (key === "CashierId" && formData.TransactionType !== "1") return null;

          const label = key.replace(/([A-Z])/g, " $1").trim();
          let inputElement;

          if (key === "TransactionType" || key === "WorkFlow") {
            inputElement = (
              <>
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded"
                >
                  <option value="" disabled>
                    Select {label}
                  </option>
                  {masterData?.[key + "s"]?.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Description}
                    </option>
                  ))}
                </select>
                {key === "TransactionType" && formData.TransactionType === "2" && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Note:</strong> Please mention transaction details in comments to avoid rejection.
                  </p>
                )}
              </>
            );
          } else if (key === "CashierId") {
            inputElement = (
              <select
                name="CashierId"
                value={formData.CashierId}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              >
                <option value="" disabled>
                  Select Cashier
                </option>
                {cashiers?.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Name}
                  </option>
                ))}
              </select>
            );
          } else {
            const type =
              key === "Amount"
                ? "number"
                : ["Date", "GivenOn"].includes(key)
                ? "date"
                : "text";
            inputElement = (
              <input
                name={key}
                type={type}
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
