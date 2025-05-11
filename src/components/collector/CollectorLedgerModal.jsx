/* eslint-disable */
import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase"; // adjust path if needed

const allowedFields = [
  "TransactionType",
  "CashierId",
  "CollectorId",
  "Amount",
  "WorkFlow",
  "Date",
  // "GivenOn",  ← we’ll still track it, but won’t render it
  "Comment",
];

export default function CollectorLedgerModal({
  collectorId,
  masterData,
  onClose,
  initialData,
  cashiers,
  editData,
  modelFor,
  selectedDate,
}) {
  // Filter workflows based on modelFor
  const workflows =
    modelFor === "CollectorLedger"
      ? masterData?.WorkFlows?.filter((_) => _?.Id === 4) // Type 4 for CollectorLedger
      : masterData?.WorkFlows; // All workflows for other cases

  // Set today's date
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    CollectorId: collectorId,
    TransactionType: "1",
    CashierId: "",
    Amount: "",
    WorkFlow: "1",
    Date: selectedDate,
    GivenOn: today,
    Comment: "",
  });

  useEffect(() => {
    if (initialData) {
      const fd = {
        Id: initialData?.Id ?? "",
        RetailerId: initialData?.RetailerId,
        CollectorId: collectorId,
        TransactionType: initialData.TransactionType ?? "",
        CashierId: initialData.CashierId ?? "",
        Amount: initialData.Amount ?? "",
        WorkFlow: initialData.WorkFlow ?? "1",
        Date: initialData.Date ? initialData.Date.split("T")[0] : "",
        GivenOn: today, // always keep today
        Comment: initialData.Comment ?? "",
      };
      setFormData(fd);
    }
  }, [initialData, collectorId, today]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleLedgerSubmit = async (data) => {
    try {
      const payload = {
        Id: data?.Id,
        RetailerId: data?.RetailerId,
        CashierId: data?.CashierId,
        CollectorId: collectorId,
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: parseInt(data.WorkFlow),
        Date: new Date(data.Date).toISOString(),
        GivenOn: new Date(data.GivenOn).toISOString(),
        Comment: data.Comment,
      };

      if (initialData?.Id) {
        await apiBase.updateLedgerInfo(payload);
      } else {
        await apiBase.addLedgerInfo(payload);
      }

      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleSubmit = () => {
    handleLedgerSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">
          {!initialData ? "Add" : "Update"} Ledger Entry
        </h2>

        {allowedFields.map((key) => {
          // hide GivenOn entirely
          if (key === "GivenOn" || key === "CollectorId") return null;

          // only show CashierId when TransactionType === "1"
          if (
            (key === "CashierId" && formData.TransactionType !== "1") ||
            (key === "WorkFlow" && modelFor === "CollectorLedger")
          ) {
            return null;
          }

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
                  {key === "WorkFlow" &&
                    workflows?.map((opt) => (
                      <option key={opt.Id} value={opt.Id}>
                        {opt.Description}
                      </option>
                    ))}
                  {key === "TransactionType" &&
                    masterData?.TransactionTypes?.map((opt) => (
                      <option key={opt.Id} value={opt.Id}>
                        {opt.Description}
                      </option>
                    ))}
                </select>
                {key === "TransactionType" &&
                  formData.TransactionType === "2" && (
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Note:</strong> Please mention transaction details
                      in comments to avoid rejection.
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
                    {c.UserName}
                  </option>
                ))}
              </select>
            );
          } else {
            const type =
              key === "Amount" ? "number" : key === "Date" ? "date" : "text";

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
