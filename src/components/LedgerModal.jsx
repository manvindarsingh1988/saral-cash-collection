/* eslint-disable */
import React, { useState, useEffect } from "react";
import { apiBase } from "../lib/apiBase"; // adjust path if needed

const allowedFields = [
  "TransactionType",
  "CashierId",
  "CollectorId",
  "Amount",
  "WorkFlow",
  "Date",
  "Comment",
  "StuckInBank",
];

export default function LedgerModal({
  userId,
  masterData,
  onClose,
  initialData,
  cashiers,
  modelFor,
}) {
  const isCollectorLedger = modelFor === "CollectorLedger";
  const isCashierLedger = modelFor === "CashierLedger";

  const workflows =
    isCollectorLedger || isCashierLedger
      ? masterData?.WorkFlows?.filter((_) => _?.Id === 4)
      : masterData?.WorkFlows;

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    CollectorId: userId,
    TransactionType: isCashierLedger ? "1" : "2",
    CashierId: "",
    Amount: "",
    WorkFlow: "1",
    Date: new Date(),
    GivenOn: today,
    Comment: "",
    StuckInBank: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        Id: initialData?.Id ?? "",
        RetailerId: initialData?.RetailerId,
        CollectorId: userId,
        TransactionType: initialData.TransactionType ?? "1",
        CashierId: initialData.CashierId ?? "",
        Amount: initialData.Amount ?? "",
        WorkFlow: initialData.WorkFlow ?? "1",
        Date: initialData.Date ? initialData.Date.split("T")[0] : today,
        GivenOn: today,
        Comment: initialData.Comment ?? "",
        StuckInBank: initialData.WorkFlow === 6,
      });
    }
  }, [initialData, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((p) => ({ ...p, File: file }));
  };

  const handleLedgerSubmit = async (data) => {
    try {
      const payload = {
        Id: data?.Id,
        RetailerId: data?.RetailerId,
        CashierId: isCashierLedger
          ? userId
          : parseInt(data.WorkFlow) === 1
          ? data?.CashierId
          : "",
        CollectorId: isCollectorLedger ? userId : "",
        Amount: parseFloat(data.Amount),
        TransactionType: parseInt(data.TransactionType),
        WorkFlow: data.StuckInBank ? 6 : parseInt(data.WorkFlow),
        Date: new Date(data.Date),
        GivenOn: new Date(data.GivenOn),
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

  const shouldRenderField = (key) => {
    if (key === "GivenOn" || key === "CollectorId") return false;
    if (key === "CashierId" && formData.TransactionType !== "1") return false;
    if (key === "WorkFlow" && (isCollectorLedger || isCashierLedger))
      return false;
    if (key === "StuckInBank" || key === "Date") return false;
    if (isCashierLedger && key === "CashierId") return false;
    return true;
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
          if (!shouldRenderField(key)) return null;

          const label = key.replace(/([A-Z])/g, " $1").trim();
          let inputElement;

          if (key === "TransactionType" || key === "WorkFlow") {
            const options =
              key === "TransactionType"
                ? masterData?.TransactionTypes?.filter((opt) =>
                    isCashierLedger ? opt.Id !== 1 : true
                  )
                : workflows?.filter((opt) => [1, 2, 3].includes(opt.Id));

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
                  {options?.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Description}
                    </option>
                  ))}
                </select>
                {key === "TransactionType" &&
                  ["2", "3"].includes(formData.TransactionType) && (
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
            const type = key === "Amount" ? "number" : "text";
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

        {formData.TransactionType === "2" && (
          <div className="flex flex-col">
            <label className="flex items-center gap-2">
              <input
                name="StuckInBank"
                type="checkbox"
                checked={formData.StuckInBank ?? false}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "StuckInBank",
                      value: e.target.checked,
                    },
                  })
                }
                className="border rounded"
              />
              Stuck in Bank
            </label>
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Upload Slip</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="border px-2 py-1 rounded"
          />
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
