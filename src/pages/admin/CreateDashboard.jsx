import React, { useEffect, useMemo, useState } from "react";
import { apiBase } from "../../lib/apiBase";
import useDocumentTitle from "../../hooks/useDocumentTitle";


function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function CreateDashboard({ userType, id }) {
  useDocumentTitle("Create Dashboard");
  // DATA
  const [retailers, setRetailers] = useState([]); // all
  const [assignedRetailers, setAssignedRetailers] = useState([]);

  const [collectors, setCollectors] = useState([]);
  const [assignedCollectors, setAssignedCollectors] = useState([]);

  const [cashiers, setCashiers] = useState([]);
  const [assignedCashiers, setAssignedCashiers] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [searchAssignedRetailers, setSearchAssignedRetailers] = useState("");
const [searchAllRetailers, setSearchAllRetailers] = useState("");

// COLLECTORS
const [searchAssignedCollectors, setSearchAssignedCollectors] = useState("");
const [searchAllCollectors, setSearchAllCollectors] = useState("");

// CASHIERS
const [searchAssignedCashiers, setSearchAssignedCashiers] = useState("");
const [searchAllCashiers, setSearchAllCashiers] = useState("");

  // Generic fetcher
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // adjust these apiBase methods to your real endpoints
      const [retAll, colAll, casAll, assigned] = await Promise.all([
        apiBase.getRetailUsers(),
        apiBase.getCollectors(),
        apiBase.getCashiers(),
        apiBase.getMappedUsers(id),
      ]);

      setRetailers(retAll || []);
      setAssignedRetailers(assigned?.Retailers || []);

      setCollectors(colAll || []);
      setAssignedCollectors(assigned?.Collectors || []);

      setCashiers(casAll || []);
      setAssignedCashiers(assigned?.Cashiers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const excludeAssigned = (all, assigned) => {
  const assignedIds = new Set(assigned.map(a => a.Id));
  return all.filter(x => !assignedIds.has(x.Id));
};

  // SEARCH / FILTER
  const filterBySearch = (list, q) => {
    if (!q) return list;
    const s = q.trim().toLowerCase();
    return list.filter((x) => (x.Name || x.UserName || "").toLowerCase().includes(s));
  };

  const visibleRetailersAll = useMemo(() => {
  const filtered = excludeAssigned(retailers, assignedRetailers);
  return filterBySearch(filtered, searchAllRetailers);
}, [retailers, assignedRetailers, searchAllRetailers]);

  const visibleRetailersAssigned = useMemo(
    () => filterBySearch(assignedRetailers, searchAssignedRetailers),
    [assignedRetailers, searchAssignedRetailers]
  );

  const visibleCollectorsAll = useMemo(() => {
  const filtered = excludeAssigned(collectors, assignedCollectors);
  return filterBySearch(filtered, searchAllCollectors);
}, [collectors, assignedCollectors, searchAllCollectors]);

  const visibleCollectorsAssigned = useMemo(
    () => filterBySearch(assignedCollectors, searchAssignedCollectors),
    [assignedCollectors, searchAssignedCollectors]
  );

  const visibleCashiersAll = useMemo(() => {
  const filtered = excludeAssigned(cashiers, assignedCashiers);
  return filterBySearch(filtered, searchAllCashiers);
}, [cashiers, assignedCashiers, searchAllCashiers]);

  const visibleCashiersAssigned = useMemo(
    () => filterBySearch(assignedCashiers, searchAssignedCashiers),
    [assignedCashiers, searchAssignedCashiers]
  );

  // ASSIGN / UNASSIGN (optimistic)
  const assign = async (type, item) => {
    // type: 'retailer' | 'collector' | 'cashier'
    try {
      if (type === "retailer") {
        setAssignedRetailers((prev) => [item, ...prev]);
        await apiBase.assignUser({ParentId: id, ChildId: item.Id, UserType: 5});
        // refetch or keep optimistic
      } else if (type === "collector") {
        setAssignedCollectors((prev) => [item, ...prev]);
        await apiBase.assignUser({ParentId: id, ChildId: item.Id, UserType: 12});
      } else if (type === "cashier") {
        setAssignedCashiers((prev) => [item, ...prev]);
        await apiBase.assignUser({ParentId: id, ChildId: item.Id, UserType: 13});
      }
    } catch (err) {
      console.error("assign failed", err);
      // rollback naive
      await fetchAllData();
    }
  };

  const unassign = async (type, itemId) => {
    try {
      if (type === "retailer") {
        setAssignedRetailers((prev) => prev.filter((r) => r.Id !== itemId));
      } else if (type === "collector") {
        setAssignedCollectors((prev) => prev.filter((r) => r.Id !== itemId));
      } else if (type === "cashier") {
        setAssignedCashiers((prev) => prev.filter((r) => r.Id !== itemId));        
      }
      await apiBase.unassignUser(id, itemId);
    } catch (err) {
      console.error("unassign failed", err);
      await fetchAllData();
    }
  };

  // DRAG & DROP using HTML5 drag events
  const [dragPayload, setDragPayload] = useState(null);

  const onDragStart = (e, type, item) => {
    setDragPayload({ type, item });
    try { e.dataTransfer.setData("text/plain", JSON.stringify({ type, id: item.Id })); } catch (e) {}
  };

  const onDropAssign = async (e, type) => {
    e.preventDefault();
    const payload = dragPayload;
    if (!payload) return;
    // only allow same category drops
    if (payload.type !== type) return;
    await assign(type, payload.item);
    setDragPayload(null);
  };

  const allowDrop = (e) => e.preventDefault();

  // small presentational components
  const ListCard = ({ title, items, onAdd, onRemove, droppableType }) => (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-semibold">{title}</h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>

      <div className="overflow-auto space-y-2 max-h-[250px]" onDragOver={allowDrop} onDrop={(e) => onDropAssign(e, droppableType)}>
        {items.map((it) => (
          <div
            key={it.Id}
            draggable
            onDragStart={(e) => onDragStart(e, droppableType, it)}
            className="p-2 rounded border flex items-center justify-between hover:shadow-sm"
          >
            <div>
              <div className="text-sm font-medium">{it.UserName}</div>
            </div>

            <div className="flex items-center gap-2">
              {onRemove && (
                <button onClick={() => onRemove(it.Id)} className="text-red-600 text-xs">Remove</button>
              )}
              {onAdd && (
                <button onClick={() => onAdd(it)} className="text-indigo-600 text-xs">Add</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* header with uploaded image preview */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-sm text-gray-500">Assign retailers, collectors and cashiers quickly using Add buttons.</p>
        </div>
        
      </div>
   
      {/* RETAILERS */}
      <section className="mt-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <input className="px-3 py-2 border rounded w-full" placeholder="Search assigned retailers" value={searchAssignedRetailers} onChange={(e) => setSearchAssignedRetailers(e.target.value)} />
      </div>
      <ListCard
        title="Assigned Retailers"
        items={visibleRetailersAssigned}
        onRemove={(id) => unassign("retailer", id)}
        droppableType="retailer"
        onDropAssign={onDropAssign}
      />
    </div>

    <div>
      <div className="mb-2 flex items-center gap-2">
        <input className="px-3 py-2 border rounded w-full" placeholder="Search all retailers" value={searchAllRetailers} onChange={(e) => setSearchAllRetailers(e.target.value)} />
      </div>
      <ListCard
        title="All Retailers"
        items={visibleRetailersAll}
        onAdd={(item) => assign("retailer", item)}
        droppableType="retailer"
        onDropAssign={onDropAssign}
      />
    </div>
  </div>
</section>

{/* COLLECTORS */}
<section className="mt-8" >
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <input className="px-3 py-2 border rounded w-full" placeholder="Search assigned collectors" value={searchAssignedCollectors} onChange={(e) => setSearchAssignedCollectors(e.target.value)} />
      </div>
      <ListCard
        title="Assigned Collectors"
        items={visibleCollectorsAssigned}
        onRemove={(id) => unassign("collector", id)}
        droppableType="collector"
        onDropAssign={onDropAssign}
      />
    </div>

    <div>
      <div className="mb-2 flex items-center gap-2">
        <input className="px-3 py-2 border rounded w-full" placeholder="Search all collectors" value={searchAllCollectors} onChange={(e) => setSearchAllCollectors(e.target.value)} />
      </div>
      <ListCard
        title="All Collectors"
        items={visibleCollectorsAll}
        onAdd={(item) => assign("collector", item)}
        droppableType="collector"
        onDropAssign={onDropAssign}
      />
    </div>
  </div>
</section>

{/* CASHIERS */}
{userType !== 13 && (
  <section className="mt-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <input className="px-3 py-2 border rounded w-full" placeholder="Search assigned cashiers" value={searchAssignedCashiers} onChange={(e) => setSearchAssignedCashiers(e.target.value)} />
        </div>
        <ListCard
          title="Assigned Cashiers"
          items={visibleCashiersAssigned}
          onRemove={(id) => unassign("cashier", id)}
          droppableType="cashier"
          onDropAssign={onDropAssign}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <input className="px-3 py-2 border rounded w-full" placeholder="Search all cashiers" value={searchAllCashiers} onChange={(e) => setSearchAllCashiers(e.target.value)} />
        </div>
        <ListCard
          title="All Cashiers"
          items={visibleCashiersAll}
          onAdd={(item) => assign("cashier", item)}
          droppableType="cashier"
          onDropAssign={onDropAssign}
        />
      </div>
    </div>
  </section>
)}

      <div className="text-sm text-gray-500">Tip: Use the Add/Remove buttons for single actions.</div>
    </div>
  );
}
