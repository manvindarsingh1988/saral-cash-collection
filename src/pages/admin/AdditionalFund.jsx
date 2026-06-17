import React, { useEffect, useMemo, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const currentDateString = () => new Date().toISOString().slice(0, 10);
const currentDateTimeLocalString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const createInitialForm = () => ({
  Id: 0,
  CollectorId: "",
  Amount: "",
  Remarks: "",
});

export default function AdditionalFund() {
  useDocumentTitle("Additional Fund");

  const [collectors, setCollectors] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterCollectorId, setFilterCollectorId] = useState("");
  const [fromDate, setFromDate] = useState(currentDateString());
  const [toDate, setToDate] = useState(currentDateString());
  const [form, setForm] = useState(createInitialForm);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate) return;
    loadEntries(filterCollectorId, fromDate, toDate);
  }, [filterCollectorId, fromDate, toDate]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");
      const [collectorData, fundData] = await Promise.all([
        apiBase.getCollectors(),
        apiBase.getAdditionalFundInfos("", fromDate, toDate),
      ]);
      setCollectors(collectorData || []);
      setEntries(fundData || []);
    } catch (err) {
      setError(err.message || "Failed to load additional fund data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadEntries(collectorId = "", fromDateValue = "", toDateValue = "") {
    try {
      setLoading(true);
      setError("");
      const fundData = await apiBase.getAdditionalFundInfos(collectorId, fromDateValue, toDateValue);
      setEntries(fundData || []);
    } catch (err) {
      setError(err.message || "Failed to load additional fund entries.");
    } finally {
      setLoading(false);
    }
  }

  const selectedCollectorName = useMemo(() => {
    return collectors.find((item) => `${item.Id}` === `${form.CollectorId}`)?.UserName || "";
  }, [collectors, form.CollectorId]);


  function resetForm() {
    setForm(createInitialForm());
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.CollectorId) {
      setError("Please select a collector.");
      return;
    }

    if (!form.Amount || Number(form.Amount) <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        Id: form.Id,
        CollectorId: form.CollectorId,
        Amount: Number(form.Amount),
        RecievedDate: currentDateTimeLocalString(),
        Remarks: form.Remarks?.trim() || "",
      };

      const response = form.Id
        ? await apiBase.updateAdditionalFundInfo(payload)
        : await apiBase.addAdditionalFundInfo(payload);

      if (response?.Response?.startsWith("Errors:")) {
        setError(response.Response);
        return;
      }

      setSuccess(response?.Response || "Additional fund entry saved successfully.");
      setForm(createInitialForm());
      await loadEntries(filterCollectorId, fromDate, toDate);
    } catch (err) {
      setError(err.message || "Failed to save additional fund entry.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(entry) {
    setError("");
    setSuccess("");
    setForm({
      Id: entry.Id,
      CollectorId: entry.CollectorId || "",
      Amount: entry.Amount ?? "",
      Remarks: entry.Remarks || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(entry) {
    const confirmed = window.confirm(
      `Delete additional fund entry for ${entry.CollectorName || entry.CollectorId}?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      const response = await apiBase.deleteAdditionalFundInfo(entry.Id);
      if (response?.Response?.startsWith("Errors:")) {
        setError(response.Response);
        return;
      }

      if (form.Id === entry.Id) {
        setForm(createInitialForm());
      }

      setSuccess(response?.Response || "Additional fund entry deleted successfully.");
      await loadEntries(filterCollectorId, fromDate, toDate);
    } catch (err) {
      setError(err.message || "Failed to delete additional fund entry.");
    }
  }

  return (
    <div className="w-full max-w-none p-4 sm:p-6 space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {form.Id ? "Edit Additional Fund" : "New Additional Fund"}
            </h2>
            <p className="text-sm text-slate-500">Current date and time will be sent automatically, and remarks are optional.</p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {success && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[2fr_0.9fr_2fr_0.9fr] xl:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Collector</label>
            <select
              name="CollectorId"
              value={form.CollectorId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Select collector</option>
              {collectors.map((collector) => (
                <option key={collector.Id} value={collector.Id}>
                  {collector.UserName} ({collector.Id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
            <input
              type="number"
              name="Amount"
              value={form.Amount}
              onChange={handleChange}
              step="0.00001"
              min="0"
              placeholder="0.00000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
            <input
              type="text"
              name="Remarks"
              value={form.Remarks}
              onChange={handleChange}
              maxLength={500}
              placeholder="Optional note about this fund entry"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="xl:self-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : form.Id ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Additional Fund Entries</h2>
            <p className="text-sm text-slate-500">Filter by collector and date range. Both dates default to today.</p>
          </div>
          <div className="grid w-full gap-4 md:grid-cols-3 xl:w-auto xl:min-w-[760px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Filter by collector</label>
              <select
                value={filterCollectorId}
                onChange={(event) => setFilterCollectorId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">All collectors</option>
                {collectors.map((collector) => (
                  <option key={collector.Id} value={collector.Id}>
                    {collector.UserName} ({collector.Id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {fromDate && toDate && fromDate > toDate ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            From Date cannot be greater than To Date.
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            Loading additional fund entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            No additional fund entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Collector</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Collector Id</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Received Date & Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Remarks</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.Id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{entry.CollectorName || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.CollectorId}</td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {Number(entry.Amount || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 5,
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {entry.RecievedDate
                        ? new Date(entry.RecievedDate).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.Remarks || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          className="rounded-lg border border-emerald-200 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


