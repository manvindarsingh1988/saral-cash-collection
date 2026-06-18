import React, { useMemo, useState } from "react";
import TruncatedCell from "./TruncatedCell";

export default function GenericTable({ columns, data }) {
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const processedData = useMemo(() => {
    const temp = [...data].filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (item[key] === undefined || item[key] === null) return false;
        return item[key].toString().toLowerCase().includes(value.toLowerCase());
      })
    );

    if (!sortConfig.key) {
      return temp;
    }

    const { key, direction } = sortConfig;
    return temp.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      const isNum = !isNaN(Number(valA)) && !isNaN(Number(valB));
      if (isNum) {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, filters, sortConfig]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="app-table-shell max-h-[600px] overflow-y-auto">
        <table className="app-table min-w-full text-xs">
          <thead className="sticky top-0 z-10 text-black">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-slate-200 text-left"
                  style={
                    col.width
                      ? { width: col.width, minWidth: col.width, maxWidth: col.width }
                      : undefined
                  }
                >
                  {col.isAction ? (
                    col.heading
                  ) : (
                    <div className="flex flex-col">
                      <div
                        className="flex cursor-pointer items-center"
                        onClick={() => onSort(col.key)}
                      >
                        <span>{col.heading}</span>
                        {sortConfig.key === col.key && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "^" : "v"}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Filter"
                        className="mt-1 w-full rounded border bg-white px-2 py-1 text-black placeholder-gray-400"
                        value={filters[col.key] || ""}
                        onChange={(e) => onFilterChange(col.key, e.target.value)}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {processedData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={
                      col.width
                        ? { width: col.width, minWidth: col.width, maxWidth: col.width }
                        : undefined
                    }
                  >
                    {col.isAction ? (
                      col.render?.(row)
                    ) : col.isCurrency ? (
                      <TruncatedCell>
                        {`Rs ${Number(row[col.key] || 0).toLocaleString("en-IN")}`}
                      </TruncatedCell>
                    ) : (
                      <TruncatedCell>{row[col.key] ?? "-"}</TruncatedCell>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
