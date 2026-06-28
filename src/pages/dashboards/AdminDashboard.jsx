import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import { apiBase } from "../../lib/apiBase";
import { formatIndianNumber } from "../../lib/utils";
import RetailerLiabilityTable from "../../components/admin/RetailerLiabilityTable";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const summaryCards = [
  { key: "totalClosingAmount", label: "Opening Amount", color: "#0f766e" },
  { key: "totalReceivedAmount", label: "Current Received Amount", color: "#0284c7" },
  { key: "totalCurrentAmount", label: "Current Amount", color: "#2563eb" },
  { key: "totalProjectionAmount", label: "Projection Amount", color: "#7c3aed" },
  { key: "totalLaibilityAmount", label: "Liability Amount", color: "#dc2626" },
  { key: "totalPendingApprovalAmount", label: "Pending Approval Amount", color: "#d97706" },
];

export default function AdminDashboard({ userType, id }) {
  useDocumentTitle("Retailer Liabilities");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [liabilities, setLiabilities] = useState([]);

  const [summary, setSummary] = useState({
    totalLaibilityAmount: 0,
    totalPendingApprovalAmount: 0,
    totalProjectionAmount: 0,
    totalRejectedAmount: 0,
    totalCurrentAmount: 0,
    totalClosingAmount: 0,
  });

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      setLoading(true);
      const retailerData = await apiBase.getLiabilityAmountOfAllRetailers(
        id,
        userType
      );

      setLiabilities(retailerData || []);

      const totalLaibilityAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.LaibilityAmount || 0),
        0
      );
      const totalPendingApprovalAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.PendingApprovalAmount || 0),
        0
      );
      const totalProjectionAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ProjectionAmount || 0),
        0
      );
      const totalRejectedAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.RejectedAmount || 0),
        0
      );
      const totalCurrentAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.CurrentAmount || 0),
        0
      );
      const totalClosingAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ClosingAmount || 0),
        0
      );
      const totalReceivedAmount = (retailerData || []).reduce(
        (sum, item) => sum + (item.ReceivedAmount || 0),
        0
      );

      setSummary({
        totalLaibilityAmount,
        totalPendingApprovalAmount,
        totalProjectionAmount,
        totalRejectedAmount,
        totalCurrentAmount,
        totalClosingAmount,
        totalReceivedAmount,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!liabilities.length) return;

    setExporting(true);
    try {
      const exportRows = liabilities.map((item) => ({
        "Retailer Name": item.UserName ?? "",
        "Opening Balance": item.ClosingAmount ?? 0,
        "Current Sale": item.CurrentAmount ?? 0,
        "Ewallet Pending Sale": item.PendingAmount ?? 0,
        "Today Received Amount": item.ReceivedAmount ?? 0,
        "Closing Amount": item.ProjectionAmount ?? 0,
        "Hold Amount": item.ProjectionAmountBeforeXMinutes ?? 0,
        "Pending Approval Amount": item.PendingApprovalAmount ?? 0,
        "Laibility Amount": item.LaibilityAmount ?? 0,
        "Projection Without Current Sale": item.ProjectionAmountWithoutCurrentSale ?? 0,
        "FixedFund Charge": item.RejectedAmount ?? 0,
        Warning: item.Warning ?? "",
        Remark: item.Remark ?? "",
        "Counter Location": item.CounterLocation ?? "",
        "Linked Collector": item.LinkedCollector ?? "",
        "Linked Cashier": item.LinkedCashier ?? "",
        "Linked Master Cashier": item.LinkedMasterCashier ?? "",
      }));

      const headers = Object.keys(exportRows[0] || {
        "Retailer Name": "",
        "Opening Balance": "",
        "Current Sale": "",
        "Ewallet Pending Sale": "",
        "Today Received Amount": "",
        "Closing Amount": "",
        "Hold Amount": "",
        "Pending Approval Amount": "",
        "Laibility Amount": "",
        "Projection Without Current Sale": "",
        "FixedFund Charge": "",
        Warning: "",
        Remark: "",
        "Counter Location": "",
        "Linked Collector": "",
        "Linked Cashier": "",
        "Linked Master Cashier": "",
      });

      const numericHeaders = new Set([
        "Opening Balance",
        "Current Sale",
        "Ewallet Pending Sale",
        "Today Received Amount",
        "Closing Amount",
        "Hold Amount",
        "Pending Approval Amount",
        "Laibility Amount",
        "Projection Without Current Sale",
        "FixedFund Charge",
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
    <sheet name="Retailer Liabilities" sheetId="1" r:id="rId1"/>
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
      link.download = `retailer-liabilities-${dateLabel}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <HeaderActions
        canExport={liabilities.length > 0}
        exportLoading={exporting}
        onExport={handleExportExcel}
      />

      {error && <div className="text-red-600">{error}</div>}

      {loading && <CenterLoader label="Loading liabilities..." />}

      {!loading && liabilities.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="py-2">
            <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {summaryCards.map(({ key, label, color }) => (
                <div key={key} className="metric-tile" style={{ "--tile-color": color }}>
                  <dt className="metric-tile-label truncate">{label}</dt>
                  <dd className="metric-tile-value">
                    Rs {formatIndianNumber(summary[key])}
                  </dd>
                </div>
              ))}
            </div>
          </div>
          <RetailerLiabilityTable
            data={liabilities}
          />
        </div>
      )}
    </div>
  );
}

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

function HeaderActions({
  canExport,
  exportLoading,
  onExport,
}) {
  const target = typeof document !== "undefined"
    ? document.getElementById("page-header-actions")
    : null;

  if (!target) return null;

  return createPortal(
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onExport}
        disabled={exportLoading || !canExport}
        className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exportLoading ? "Exporting..." : "Export Excel"}
      </button>
    </div>,
    target
  );
}
