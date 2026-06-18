/* eslint-disable */
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiBase } from "../lib/apiBase";
import SearchableSelect from "./SearchableSelect";
import {
  generateSafeGuid,
  handleDownloadFile,
  zipFilesToBlob
} from "../lib/utils";
import { sanitiseLedgerPayload } from "../lib/ledgerRuleEngine";

export default function LedgerModal({
  userId,
  masterData,
  onClose,
  initialData,
  cashiers,
  collectors,
  modelFor,
}) {
  const isCollectorLedger = modelFor === "CollectorLedger";
  const isCashierLedger = modelFor === "CashierLedger";
  const now = new Date();

  const workflows =
    isCollectorLedger || isCashierLedger
      ? masterData?.WorkFlows?.filter((w) => w?.Id === 4)
      : masterData?.WorkFlows;

  const today = now.toISOString().split("T")[0];

  const buildValuationDate = (selectedDate) => {
    if (!selectedDate) {
      return new Date();
    }

    if (selectedDate === today) {
      return new Date();
    }

    return new Date(`${selectedDate}T23:55:00`);
  };

  const [formData, setFormData] = useState({
    RetailerId: "",
    CollectorId: userId,
    TransactionType: isCashierLedger ? "2" : "1",
    CashierId: "",
    ToCollector: "",
    HandoverTo: "cashier",
    Amount: "",
    WorkFlow: "1",
    Date: today,
    ValuationDate: today,
    GivenOn: today,
    Comment: "",
    StuckInBank: false,
    StuckInCDM: false,
    File: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        Id: initialData?.Id ?? "",
        RetailerId: initialData?.RetailerId ?? "",
        CollectorId: userId,
        TransactionType: initialData?.TransactionType?.toString() ?? "1",
        CashierId: initialData?.CashierId?.toString() ?? "",
        ToCollector: initialData?.ToCollector?.toString() ?? "",
        HandoverTo:
          initialData?.TransactionType?.toString() === "1" &&
          initialData?.ToCollector
            ? "collector"
            : "cashier",
        Amount: initialData?.Amount ?? "",
        WorkFlow: initialData?.WorkFlow?.toString() ?? "1",
        Date: initialData?.Date?.split("T")[0] ?? today,
        ValuationDate:
          initialData?.ValuationDate?.split("T")[0] ??
          initialData?.Date?.split("T")[0] ??
          today,
        GivenOn: today,
        Comment: initialData?.Comment ?? "",
        StuckInBank: initialData?.WorkFlow === 6,
        StuckInCDM: initialData?.WorkFlow === 8,
        DocId: initialData?.DocId ?? null,
        File: null,
      });
    }
  }, [initialData, userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      ...(name === "TransactionType" && value !== "1"
        ? { CashierId: "", ToCollector: "", HandoverTo: "cashier" }
        : {}),
      ...(name === "HandoverTo"
        ? {
            CashierId: value === "cashier" ? prev.CashierId : "",
            ToCollector: value === "collector" ? prev.ToCollector : "",
          }
        : {}),
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, File: Array.from(e.target.files) }));
  };

  const handleSubmit = async () => {
    const docId = formData?.DocId || generateSafeGuid();
    let fileSaved = false;
    const isCollectorToCollectorHandover =
      isCollectorLedger &&
      formData.TransactionType === "1" &&
      formData.HandoverTo === "collector";

    if (
      !isCashierLedger &&
      formData.TransactionType === "1" &&
      !isCollectorToCollectorHandover &&
      !formData.CashierId
    ) {
      alert("Select valid casheir");
      return;
    }
    if (isCollectorToCollectorHandover && !formData.ToCollector) {
      alert("Select valid collector");
      return;
    }
    if (formData.File) {
      try {
        const blob = await zipFilesToBlob(formData.File); // convert to byte array
        await apiBase.uploadFile(blob, docId); // adjust API if needed to accept byte array
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
        : parseInt(formData.WorkFlow) === 1 && !isCollectorToCollectorHandover
        ? formData.CashierId
        : "",
      CollectorId: isCollectorLedger ? userId : "",
      ToCollector: isCollectorToCollectorHandover ? formData.ToCollector : "",
      ToCollectorName: isCollectorToCollectorHandover
        ? collectors?.find((collector) => `${collector.Id}` === `${formData.ToCollector}`)
            ?.UserName || ""
        : "",
      Amount: parseFloat(formData.Amount),
      TransactionType: parseInt(formData.TransactionType),
      WorkFlow: formData.StuckInBank ? 6 : formData.StuckInCDM ? 8 : 1,
      Date: new Date(formData.Date),
      ValuationDate: isCollectorLedger
        ? buildValuationDate(formData.ValuationDate)
        : null,
      GivenOn: new Date(formData.GivenOn),
      Comment: formData.Comment,
      DocId:
        formData.File && fileSaved
          ? docId
          : formData?.Id
          ? formData.DocId
          : null,
    };

    console.log("Payload before sanitization:", payload);
    const sanitizedPayload = sanitiseLedgerPayload(payload);
    console.log("Sanitized Payload:", sanitizedPayload);

    try {
      if (formData.Id) {
        await apiBase.updateLedgerInfo(sanitizedPayload);
      } else {
        await apiBase.addLedgerInfo(sanitizedPayload);
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm">
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">
              {!initialData ? "Add" : "Update"} Ledger Entry
            </h2>
            <p className="app-modal-subtitle">
              Enter ledger details and save the transaction.
            </p>
          </div>
          <button onClick={onClose} className="app-modal-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body">
          <div className="app-modal-form">
        <div className="app-modal-field">
          <label className="app-modal-label">Transaction Type</label>
          <select
            name="TransactionType"
            value={formData.TransactionType}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
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
          {["2", "3", "4", "5", "6"].includes(formData.TransactionType) && (
            <p className="app-modal-note">
              <strong>Note:</strong> Please mention transaction details in
              comments to avoid rejection.
            </p>
          )}
        </div>

        {isCollectorLedger && formData.TransactionType === "1" && (
          <div className="app-modal-field">
            <label className="app-modal-label">Handover To</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="HandoverTo"
                  value="cashier"
                  checked={formData.HandoverTo === "cashier"}
                  onChange={handleChange}
                />
                Cashier
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="HandoverTo"
                  value="collector"
                  checked={formData.HandoverTo === "collector"}
                  onChange={handleChange}
                />
                Collector
              </label>
            </div>
          </div>
        )}

        {/* Cashier */}
        {!isCashierLedger &&
          formData.TransactionType === "1" &&
          formData.HandoverTo === "cashier" && (
          <div className="app-modal-field">
            <label className="app-modal-label">Cashier</label>
            <select
              name="CashierId"
              value={formData.CashierId}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
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

        {isCollectorLedger &&
          formData.TransactionType === "1" &&
          formData.HandoverTo === "collector" && (
            <div className="app-modal-field">
              <label className="app-modal-label">To Collector</label>
              <SearchableSelect
                value={formData.ToCollector}
                onChange={(value) =>
                  handleChange({ target: { name: "ToCollector", value } })
                }
                options={(collectors
                  ?.filter((collector) => `${collector.Id}` !== `${userId}`)
                  .map((collector) => ({
                    value: collector.Id,
                    label: `${collector.UserName} (${collector.Id})`,
                  })) || [])}
                placeholder="Select Collector"
                searchPlaceholder="Search collector..."
              />
            </div>
          )}

        {/* Amount */}
        <div className="app-modal-field">
          <label className="app-modal-label">Amount</label>
          <input
            name="Amount"
            type="number"
            value={formData.Amount}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        {isCollectorLedger && (
          <div className="app-modal-field">
            <label className="app-modal-label">Valuation Date</label>
            <input
              name="ValuationDate"
              type="date"
              value={formData.ValuationDate}
              onChange={handleChange}
              max={today}
              className="border px-3 py-2 rounded-lg"
            />
            <p className="app-modal-note">
              Today sends current date and time. Past dates send 23:55:00.
            </p>
          </div>
        )}

        {/* WorkFlow */}
        {!isCollectorLedger && !isCashierLedger && (
          <div className="app-modal-field">
            <label className="app-modal-label">WorkFlow</label>
            <select
              name="WorkFlow"
              value={formData.WorkFlow}
              onChange={handleChange}
              className="border px-3 py-2 rounded-lg"
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
        <div className="app-modal-field">
          <label className="app-modal-label">Comment</label>
          <input
            name="Comment"
            type="text"
            value={formData.Comment}
            onChange={handleChange}
            className="border px-3 py-2 rounded-lg"
          />
        </div>

        {/* StuckInBank */}
        {formData.TransactionType === "2" && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
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

        {/* StuckInCDM */}
        {formData.TransactionType === "6" && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              name="StuckInCDM"
              type="checkbox"
              checked={formData.StuckInCDM}
              onChange={handleChange}
              className="border rounded"
            />
            <label className="text-sm text-gray-600">Stuck in CDM</label>
          </div>
        )}

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
