/* eslint-disable */
import React, { useState, useEffect } from "react";
import { apiBase } from "../lib/apiBase";
import {
  base64ToByteArray,
  generateSafeGuid,
  handleDownloadFile,
  zipFileAndGetBase64,
} from "../lib/utils";

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
      ? masterData?.WorkFlows?.filter((w) => w?.Id === 4)
      : masterData?.WorkFlows;

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    RetailerId: "",
    CollectorId: userId,
    TransactionType: isCashierLedger ? "2" : "1",
    CashierId: "",
    Amount: "",
    WorkFlow: "1",
    Date: today,
    GivenOn: today,
    Comment: "",
    StuckInBank: false,
    File: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        Id: initialData?.Id ?? "",
        RetailerId: initialData?.RetailerId ?? "",
        CollectorId: userId,
        TransactionType: initialData?.TransactionType?.toString() ?? "1",
        CashierId: initialData?.CashierId?.toString() ?? "",
        Amount: initialData?.Amount ?? "",
        WorkFlow: initialData?.WorkFlow?.toString() ?? "1",
        Date: initialData?.Date?.split("T")[0] ?? today,
        GivenOn: today,
        Comment: initialData?.Comment ?? "",
        StuckInBank: initialData?.WorkFlow === 6,
        DocId: initialData?.DocId ?? null,
        File: null,
      });
    }
  }, [initialData, userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, File: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    const docId = formData?.DocId || generateSafeGuid();
    let fileSaved = false;
    if (
      !isCashierLedger &&
      formData.TransactionType === "1" &&
      !formData.CashierId
    ) {
      alert("Select valid casheir");
      return;
    }
    if (formData.File) {
      try {
        const byteArray = await zipFileAndGetBase64(formData.File); // convert to byte array
        await apiBase.uploadFile(byteArray, docId); // adjust API if needed to accept byte array
        fileSaved = true;
      } catch (err) {
        console.error("File upload failed:", err);
        fileSaved = false;
      }
    }

    const payload = {
      Id: formData.Id,
      RetailerId: formData.RetailerId,
      CashierId: isCashierLedger
        ? userId
        : parseInt(formData.WorkFlow) === 1
        ? formData.CashierId
        : "",
      CollectorId: isCollectorLedger ? userId : "",
      Amount: parseFloat(formData.Amount),
      TransactionType: parseInt(formData.TransactionType),
      WorkFlow: formData.StuckInBank ? 6 : parseInt(formData.WorkFlow),
      Date: new Date(formData.Date),
      GivenOn: new Date(formData.GivenOn),
      Comment: formData.Comment,
      DocId: formData.File && fileSaved ? docId : formData?.Id ? formData.DocId : null,
    };

    try {
      if (formData.Id) {
        await apiBase.updateLedgerInfo(payload);
      } else {
        await apiBase.addLedgerInfo(payload);
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">
          {!initialData ? "Add" : "Update"} Ledger Entry
        </h2>

        {/* Transaction Type */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Transaction Type</label>
          <select
            name="TransactionType"
            value={formData.TransactionType}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          >
            <option value="" disabled>
              Select Transaction Type
            </option>
            {masterData?.TransactionTypes?.filter((t) =>
              isCashierLedger ? t.Id !== 1 : true
            ).map((type) => (
              <option key={type.Id} value={type.Id}>
                {type.Description}
              </option>
            ))}
          </select>
          {["2", "3", "4"].includes(formData.TransactionType) && (
            <p className="text-xs text-gray-500 mt-1">
              <strong>Note:</strong> Please mention transaction details in
              comments to avoid rejection.
            </p>
          )}
        </div>

        {/* Cashier */}
        {!isCashierLedger && formData.TransactionType === "1" && (
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Cashier</label>
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
          </div>
        )}

        {/* Amount */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Amount</label>
          <input
            name="Amount"
            type="number"
            value={formData.Amount}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        </div>

        {/* WorkFlow */}
        {!isCollectorLedger && !isCashierLedger && (
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">WorkFlow</label>
            <select
              name="WorkFlow"
              value={formData.WorkFlow}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            >
              <option value="" disabled>
                Select Workflow
              </option>
              {workflows
                ?.filter((w) => [1, 2, 3].includes(w.Id))
                .map((w) => (
                  <option key={w.Id} value={w.Id}>
                    {w.Description}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Comment */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Comment</label>
          <input
            name="Comment"
            type="text"
            value={formData.Comment}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        </div>

        {/* StuckInBank */}
        {formData.TransactionType === "2" && (
          <div className="flex items-center gap-2">
            <input
              name="StuckInBank"
              type="checkbox"
              checked={formData.StuckInBank}
              onChange={handleChange}
              className="border rounded"
            />
            <label className="text-sm text-gray-600">Stuck in Bank</label>
          </div>
        )}

        {/* File Upload */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Upload Slip</label>
          <input
            type="file"
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

        {/* Buttons */}
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
