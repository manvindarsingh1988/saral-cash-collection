import React, { useEffect, useMemo, useState } from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";

const emptyForm = { Id: "", Name: "", Code: "", Active: true };
const getId = (item) => item?.Id ?? item?.id ?? item?.MarketLocationId ?? item?.marketLocationId;
const getName = (item) => item?.Name ?? item?.name ?? item?.MarketLocation ?? item?.marketLocation ?? "";

export default function MarketLocations() {
  useDocumentTitle("Market Locations");
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiBase.getMarketLocations();
      setLocations(Array.isArray(response) ? response : response?.Data || []);
    } catch (err) {
      setError(err.message || "Unable to load market locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLocations(); }, []);

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return locations.filter((location) => `${getName(location)} ${location?.Code ?? location?.code ?? ""}`.toLowerCase().includes(normalized));
  }, [locations, query]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.Name.trim()) { setError("Market Location name is required."); return; }
    try {
      setSaving(true); setError("");
      const response = await apiBase.saveMarketLocation({ Id: form.Id || 0, Name: form.Name.trim(), Code: form.Code.trim(), Active: form.Active });
      if (response?.Response === false || response?.success === false) throw new Error(response?.Message || "Unable to save market location.");
      setSuccess(form.Id ? "Market Location updated." : "Market Location added.");
      setForm(emptyForm); await loadLocations();
    } catch (err) { setError(err.message || "Unable to save market location."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (location) => {
    const id = getId(location);
    if (!id || !window.confirm(`Delete ${getName(location)}?`)) return;
    try {
      setError(""); const response = await apiBase.deleteMarketLocation(id);
      if (response?.Response === false || response?.success === false) throw new Error(response?.Message || "Unable to delete market location.");
      setSuccess("Market Location deleted.");
      if (String(form.Id) === String(id)) setForm(emptyForm);
      await loadLocations();
    } catch (err) { setError(err.message || "Unable to delete market location."); }
  };

  return (
    <div className="w-full space-y-5">
      {(error || success) && <div className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || success}</div>}
      <section className="app-surface rounded-2xl p-5 sm:p-6">
        {form.Id ? <div className="mb-4 flex justify-end"><button type="button" className="app-button-secondary" onClick={() => setForm(emptyForm)}>Cancel edit</button></div> : null}
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_220px_140px_auto] md:items-end">
          <label className="block text-sm font-medium text-slate-700">Market Location<input value={form.Name} onChange={(e) => setForm((current) => ({ ...current, Name: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="e.g. Sadar Bazaar" maxLength={150} /></label>
          <label className="block text-sm font-medium text-slate-700">Code <span className="font-normal text-slate-400">(optional)</span><input value={form.Code} onChange={(e) => setForm((current) => ({ ...current, Code: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="e.g. SADAR" maxLength={40} /></label>
          <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.Active} onChange={(e) => setForm((current) => ({ ...current, Active: e.target.checked }))} /> Active</label>
          <button type="submit" disabled={saving} className="app-button-primary disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : form.Id ? "Update" : "Add Location"}</button>
        </form>
      </section>
      <section className="app-surface overflow-hidden rounded-2xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-slate-900">Market Locations</h2><p className="text-xs text-slate-500">{locations.length} total location{locations.length === 1 ? "" : "s"}</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:w-64" placeholder="Search locations..." /></div>
        <div className="app-table-shell m-4"><table className="app-table min-w-[650px] text-sm"><thead><tr><th>Name</th><th>Code</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="4" className="py-10 text-center text-slate-500">Loading market locations...</td></tr> : filteredLocations.map((location) => { const id = getId(location); const name = getName(location); const active = location?.Active ?? location?.active ?? true; return <tr key={id || name}><td className="font-medium">{name}</td><td>{location?.Code ?? location?.code ?? "-"}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{active ? "Active" : "Inactive"}</span></td><td className="text-right"><button type="button" className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-800" onClick={() => setForm({ Id: id, Name: name, Code: location?.Code ?? location?.code ?? "", Active: !!active })}>Edit</button><button type="button" className="text-sm font-semibold text-red-600 hover:text-red-800" onClick={() => handleDelete(location)}>Delete</button></td></tr>; })}
          {!loading && filteredLocations.length === 0 ? <tr><td colSpan="4" className="py-10 text-center text-slate-500">No market locations found.</td></tr> : null}
        </tbody></table></div>
      </section>
    </div>
  );
}
