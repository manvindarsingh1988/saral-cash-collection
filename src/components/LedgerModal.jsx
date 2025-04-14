import React, { useState, useEffect } from "react";

export default function LedgerModal({
  collectors,
  masterData,
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) {
  const [formData, setFormData] = useState({
    CollectorId: "",
    Amount: "",
    TransactionType: "",
    WorkFlow: "",
    Date: "",
    GivenOn: "",
    Comment: "",
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = { ...initialData };
      ["Date", "GivenOn"].forEach((field) => {
        if (formattedData[field]) {
          formattedData[field] = new Date(formattedData[field])
            .toISOString()
            .split("T")[0];
        }
      });
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">Ledger Entry</h2>
        {Object.keys(formData).map((key) => {
          if (["Id", "RetailerId", "RetailerName"].includes(key)) return null;

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
                  <option key={collector.id} value={collector.id}>
                    {collector.name}
                  </option>
                ))}
              </select>
            );
          } else if (key === "TransactionType") {
            inputElement = (
              <select
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              >
                <option value="" disabled hidden>
                  Select Transaction Type
                </option>
                {masterData?.TransactionTypes?.map((type) => (
                  <option key={type.Id} value={type.Id}>
                    {type.Description}
                  </option>
                ))}
              </select>
            );
          } else if(key === "WorkFlow") {
            ""
          } else {
            const inputType = ["Amount", "WorkFlow"].includes(key)
              ? "number"
              : ["Date", "GivenOn"].includes(key)
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
