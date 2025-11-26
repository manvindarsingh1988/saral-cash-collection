import React, { useState, useMemo } from "react";

export default function GenericTable({ columns, data }) {
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Filter handler
  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Sorting handler
  const onSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // Processed data (filter + sort)
  const processedData = useMemo(() => {
    let temp = [...data];

    // Filtering
    temp = temp.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (item[key] === undefined || item[key] === null) return false;
        return item[key].toString().toLowerCase().includes(value.toLowerCase());
      })
    );

    // Sorting
    if (sortConfig.key) {
      const { key, direction } = sortConfig;

      temp.sort((a, b) => {
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
    }

    return temp;
  }, [data, filters, sortConfig]);

  return (
    <div className="overflow-x-auto w-full">
        <div className="max-h-[600px] overflow-y-auto border rounded">
      <table className="min-w-full text-xs border rounded">
        <thead className="bg-indigo-300 text-black sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 border text-left">
                {col.isAction ? (
                  col.heading
                ) : (
                  <div className="flex flex-col">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => onSort(col.key)}
                    >
                      <span>{col.heading}</span>
                      {sortConfig.key === col.key && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>

                    {/* Filter Input */}
                    <input
                      type="text"
                      placeholder="Filter"
                      className="mt-1 px-2 py-1 border rounded text-black placeholder-gray-400 bg-white"
                      value={filters[col.key] || ""}
                      onChange={(e) =>
                        onFilterChange(col.key, e.target.value)
                      }
                    />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {processedData.map((row, idx) => (
            <tr key={idx} className="border-b">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {col.isAction
                    ? col.render?.(row)
                    : col.isCurrency
                    ? `₹${Number(row[col.key]).toLocaleString("en-IN")}`
                    : row[col.key]}
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
