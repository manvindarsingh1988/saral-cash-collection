import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import LadgerDetailsDialog from "../../components/LedgerDetailsDialog";
import Tooltip from "../../components/Tooltip";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";
import { formatIndianNumber } from "../../lib/utils";

const columns = [  
  { key: "UserId", label: "ID", width: "110px" },
  { key: "UserName", label: "Name", width: "260px" },
  { key: "ClosingAmount", label: "Opening Amount", width: "150px" },
  { key: "CurrentAmount", label: "Today Collection Amount", width: "170px" },
  { key: "ReceivedAmount", label: "Today Handover Amount", width: "170px" },
  { key: "ProjectionAmount", label: "Closing Amount", width: "150px" },  
  { key: "PendingApprovalAmount", label: "Pending Approval Amount(Office)", width: "210px" },
  { key: "RejectedAmount", label: "CDM/Bank Stuck Amount", width: "170px" },
  { key: "LaibilityAmount", label: "Liability (Rs)", width: "150px" },
  { key: "RetailerInitiatedAmount", label: "Retailers Initiated Amount", width: "180px" },
  { key: "CollectorInitiatedAmount", label: "Collectors Initiated Amount", width: "180px" },
  { key: "Warning", label: "Warning", width: "150px" },
  { key: "LinkedCashier", label: "Linked Cashier", width: "200px" },
  { key: "LinkedMasterCashier", label: "Linked Master Cashier", width: "230px" },
];

const currencyText = (value) => `Rs ${formatIndianNumber(value || 0)}`;

function CenterLoader({ label = "Loading..." }) {
  return (
    <div className="app-loading-state">
      <div className="app-loading-card">
        <div className="app-spinner" />
        <div className="app-loading-label">{label}</div>
      </div>
    </div>
  );
}

export default function CollectorLiabilities({ userType, id }) {
  useDocumentTitle("Collector Liabilities");

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [collectorLiabilities, setCollectorLiabilities] = useState([]);
  const [modelFor, setModelFor] = useState("Handover");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalReceivedAmount: 0,
    totalClosingAmount: 0,
    totalRetailerInitiatedAmount: 0,
    totalCollectorInitiatedAmount: 0,
  });

  const [filters, setFilters] = useState({
    Warning: "",
    UserId: "",
    UserName: "",
    ClosingAmount: "",
    LaibilityAmount: "",
    PendingApprovalAmount: "",
    ProjectionAmount: "",
    CurrentAmount: "",
    ReceivedAmount: "",
    RejectedAmount: "",
    RetailerInitiatedAmount: "",
    CollectorInitiatedAmount: "",
    LinkedCashier: "",
    LinkedMasterCashier: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchCollectorLiabilities();
  }, []);

  const fetchCollectorLiabilities = async () => {
    try {
      setLoading(true);
      const data = await apiBase.getCollectorLiabilities(id, userType);
      setCollectorLiabilities(data || []);

      setSummary({
        totalLaibilityAmount: data.reduce((acc, x) => acc + (x.LaibilityAmount || 0), 0),
        totalPendingApprovalAmount: data.reduce((acc, x) => acc + (x.PendingApprovalAmount || 0), 0),
        totalProjectionAmount: data.reduce((acc, x) => acc + (x.ProjectionAmount || 0), 0),
        totalRejectedAmount: data.reduce((acc, x) => acc + (x.RejectedAmount || 0), 0),
        totalCurrentAmount: data.reduce((acc, x) => acc + (x.CurrentAmount || 0), 0),
        totalReceivedAmount: data.reduce((acc, x) => acc + (x.ReceivedAmount || 0), 0),
        totalClosingAmount: data.reduce((acc, x) => acc + (x.ClosingAmount || 0), 0),
        totalRetailerInitiatedAmount: data.reduce((acc, x) => acc + (x.RetailerInitiatedAmount || 0), 0),
        totalCollectorInitiatedAmount: data.reduce((acc, x) => acc + (x.CollectorInitiatedAmount || 0), 0),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredData = sortTableRows(
    collectorLiabilities.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    ),
    sortConfig
  );

  const handleMoreDetails = (collectorId, model) => {
    setSelectedCollector(collectorId);
    setModelFor(model);
    setOpenDialog(true);
  };

  const handleExportExcel = async () => {
    if (!filteredData.length) return;

    setExporting(true);
    try {
      const exportRows = filteredData.map((item) => ({
        ID: item.UserId ?? "",
        Name: item.UserName ?? "",
        "Opening Amount": item.ClosingAmount ?? 0,
        "Today Collection Amount": item.CurrentAmount ?? 0,
        "Today Handover Amount": item.ReceivedAmount ?? 0,
        "Closing Amount": item.ProjectionAmount ?? 0,
        "Pending Approval Amount(Office)": item.PendingApprovalAmount ?? 0,
        "CDM/Bank Stuck Amount": item.RejectedAmount ?? 0,
        "Liability Amount": item.LaibilityAmount ?? 0,
        "Retailers Initiated Amount": item.RetailerInitiatedAmount ?? 0,
        "Collectors Initiated Amount": item.CollectorInitiatedAmount ?? 0,
        Warning: item.Warning ?? "",
        "Linked Cashier": item.LinkedCashier ?? "",
        "Linked Master Cashier": item.LinkedMasterCashier ?? "",
      }));

      const headers = Object.keys(exportRows[0] || {
        ID: "",
        Name: "",
        "Opening Amount": "",
        "Today Collection Amount": "",
        "Today Handover Amount": "",
        "Closing Amount": "",
        "Pending Approval Amount(Office)": "",
        "CDM/Bank Stuck Amount": "",
        "Liability Amount": "",
        "Retailers Initiated Amount": "",
        "Collectors Initiated Amount": "",
        Warning: "",
        "Linked Cashier": "",
        "Linked Master Cashier": "",
      });

      const numericHeaders = new Set([
        "Opening Amount",
        "Today Collection Amount",
        "Today Handover Amount",
        "Closing Amount",
        "Pending Approval Amount(Office)",
        "CDM/Bank Stuck Amount",
        "Liability Amount",
        "Retailers Initiated Amount",
        "Collectors Initiated Amount",
      ]);

      const xmlEscape = (value) =>
        String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const getColumnName = (index) => {
        let columnName = "";
        let current = index + 1;

        while (current > 0) {
          const remainder = (current - 1) % 26;
          columnName = String.fromCharCode(65 + remainder) + columnName;
          current = Math.floor((current - 1) / 26);
        }

        return columnName;
      };

      const buildCell = (rowIndex, columnIndex, value, isHeader = false) => {
        const cellRef = `${getColumnName(columnIndex)}${rowIndex}`;

        if (!isHeader && typeof value === "number" && Number.isFinite(value)) {
          return `<c r="${cellRef}"><v>${value}</v></c>`;
        }

        return `<c r="${cellRef}" t="inlineStr"${isHeader ? ' s="1"' : ""}><is><t>${xmlEscape(value)}</t></is></c>`;
      };

      const sheetRows = [
        `<row r="1">${headers
          .map((header, columnIndex) => buildCell(1, columnIndex, header, true))
          .join("")}</row>`,
        ...exportRows.map((row, rowIndex) => {
          const excelRowIndex = rowIndex + 2;
          return `<row r="${excelRowIndex}">${headers
            .map((header, columnIndex) => {
              const value = row[header];
              if (numericHeaders.has(header)) {
                return buildCell(
                  excelRowIndex,
                  columnIndex,
                  Number(value) || 0,
                  false
                );
              }
              return buildCell(excelRowIndex, columnIndex, value, false);
            })
            .join("")}</row>`;
        }),
      ].join("");

      const lastColumnName = getColumnName(headers.length - 1);
      const lastRowNumber = exportRows.length + 1;
      const autoFilterRange = `A1:${lastColumnName}${lastRowNumber}`;

      const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${autoFilterRange}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="${autoFilterRange}"/>
</worksheet>`;

      const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Collector Liabilities" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

      const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border>
      <left/><right/><top/><bottom/><diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;

      const zip = new JSZip();
      zip.file(
        "[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
      );
      zip.folder("_rels").file(
        ".rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
      );
      zip.folder("docProps").file(
        "app.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
</Properties>`
      );
      zip.folder("docProps").file(
        "core.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Saral Cash Collection</dc:creator>
  <cp:lastModifiedBy>Saral Cash Collection</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`
      );

      const xlFolder = zip.folder("xl");
      xlFolder.file("workbook.xml", workbookXml);
      xlFolder.file("styles.xml", stylesXml);
      xlFolder.folder("_rels").file(
        "workbook.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
      );
      xlFolder.folder("worksheets").file("sheet1.xml", sheetXml);

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateLabel = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `collector-liabilities-${dateLabel}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <HeaderActions
        canExport={filteredData.length > 0}
        exportLoading={exporting}
        onExport={handleExportExcel}
      />

      {loading && <CenterLoader label="Loading collector liabilities..." />}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && collectorLiabilities.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="liability-summary grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {[
              { label: "Opening Amount", value: summary.totalClosingAmount },
              { label: "Today Collection Amount", value: summary.totalCurrentAmount },
              { label: "Today Handover Amount", value: summary.totalReceivedAmount },
              { label: "Closing Amount", value: summary.totalProjectionAmount },
              { label: "Pending Approval Amount(Office)", value: summary.totalPendingApprovalAmount },
              { label: "CDM/Bank Stuck Amount", value: summary.totalRejectedAmount },
            ].map((item) => (
              <div key={item.label} className="metric-tile">
                <span className="metric-tile-label">{item.label}</span>
                <span className="metric-tile-value">{currencyText(item.value)}</span>
              </div>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="app-table-shell min-h-0 flex-1 overflow-auto">
              <table className="app-table min-w-full text-sm text-gray-700">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-4 py-2 text-left"
                        style={{ width: column.width, minWidth: column.width, maxWidth: column.width }}
                      >
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className={`flex items-center gap-1 text-left ${column.key === "Warning" ? "text-red-600" : ""}`}
                        >
                          <span>{column.label}</span>
                          <span className="text-[10px] text-slate-400">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-white">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-2">
                        <input
                          type="text"
                          placeholder={column.key}
                          className="w-full rounded border px-2 py-1 text-sm"
                          value={filters[column.key] || ""}
                          onChange={(e) => onFilterChange(column.key, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.UserId} className="border-t text-xs">                      
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.UserId}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.UserName || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.ClosingAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.CurrentAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.ReceivedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.ProjectionAmount)}</TruncatedCell>
                      </td>                      
                      <td className="px-4 py-2">
                        <Tooltip content={currencyText(item.PendingApprovalAmount)} className="block w-full">
                          <TruncatedCell>{currencyText(item.PendingApprovalAmount)}</TruncatedCell>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.RejectedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <Tooltip content={currencyText(item.LaibilityAmount)} className="block w-full">
                          <TruncatedCell>{currencyText(item.LaibilityAmount)}</TruncatedCell>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.RetailerInitiatedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{currencyText(item.CollectorInitiatedAmount)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell className="text-red-600">{item.Warning || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.LinkedCashier || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-2">
                        <TruncatedCell>{item.LinkedMasterCashier || "-"}</TruncatedCell>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {openDialog && (
        <LadgerDetailsDialog
          onClose={() => {
            setOpenDialog(false);
            setSelectedCollector(null);
          }}
          userId={selectedCollector}
          modelFor={modelFor}
        />
      )}
    </div>
  );
}

function HeaderActions({ canExport, exportLoading, onExport }) {
  const target =
    typeof document !== "undefined"
      ? document.getElementById("page-header-actions")
      : null;

  if (!target) return null;

  return createPortal(
    <div className="flex w-full justify-end">
      <button
        type="button"
        onClick={onExport}
        disabled={exportLoading || !canExport}
        className={`app-button-secondary ${
          exportLoading || !canExport ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        {exportLoading ? "Exporting..." : "Export to Excel"}
      </button>
    </div>,
    target
  );
}
