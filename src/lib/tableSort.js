export function compareTableValues(a, b) {
  const valueA = normalizeTableValue(a);
  const valueB = normalizeTableValue(b);

  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
}

export function sortTableRows(rows, sortConfig, valueGetter = (row, key) => row[key]) {
  if (!sortConfig?.key) {
    return rows;
  }

  const { key, direction = "asc" } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...rows].sort((rowA, rowB) => {
    const result = compareTableValues(
      valueGetter(rowA, key),
      valueGetter(rowB, key)
    );
    return result * multiplier;
  });
}

function normalizeTableValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const trimmed = String(value).trim();
  const numeric = Number(trimmed.replace(/,/g, ""));
  if (!Number.isNaN(numeric) && trimmed !== "") {
    return numeric;
  }

  const date = Date.parse(trimmed);
  if (!Number.isNaN(date) && /[-/:T]/.test(trimmed)) {
    return date;
  }

  return trimmed.toLowerCase();
}
