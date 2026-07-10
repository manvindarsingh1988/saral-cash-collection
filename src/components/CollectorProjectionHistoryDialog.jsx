import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import JSZip from "jszip";
import { Download, X } from "lucide-react";
import { apiBase } from "../lib/apiBase";
import { formatIndianNumber, formatToCustom } from "../lib/utils";

const columns = [
  { key: "ReportDate", label: "Report Date" },
  { key: "OpeningAmount", label: "Opening Amount" },
  { key: "CurrentSale", label: "Collection Amount" },
  { key: "HandoverAmount", label: "Handover Amount" },
  { key: "ClosingAmount", label: "Closing Amount" },
];

export default function CollectorProjectionHistoryDialog({
  userId,
  userName,
  onClose,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadRows = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiBase.getCollectorProjectionAmountLast7Days(userId);

        if (active) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load projection history.");
          setRows([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      loadRows();
    } else {
      setRows([]);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [userId]);

  const renderValue = (row, key) => {
    if (key === "ReportDate") {
      return formatToCustom(row[key]) || "-";
    }

    return `Rs ${formatIndianNumber(row[key] || 0)}`;
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (accumulator, row) => ({
          OpeningAmount:
            accumulator.OpeningAmount + (Number(row.OpeningAmount) || 0),
          CurrentSale: accumulator.CurrentSale + (Number(row.CurrentSale) || 0),
          HandoverAmount:
            accumulator.HandoverAmount + (Number(row.HandoverAmount) || 0),
          ClosingAmount:
            accumulator.ClosingAmount + (Number(row.ClosingAmount) || 0),
        }),
        {
          OpeningAmount: 0,
          CurrentSale: 0,
          HandoverAmount: 0,
          ClosingAmount: 0,
        }
      ),
    [rows]
  );

  const handleExportExcel = async () => {
    if (!rows.length) return;

    setExporting(true);
    try {
      const exportRows = rows.map((row) => ({
        "Report Date": formatToCustom(row.ReportDate) || "",
        "Opening Amount": Number(row.OpeningAmount) || 0,
        "Current Sale": Number(row.CurrentSale) || 0,
        "Handover Amount": Number(row.HandoverAmount) || 0,
        "Closing Amount": Number(row.ClosingAmount) || 0,
      }));

      exportRows.push({
        "Report Date": "Total",
        "Opening Amount": totals.OpeningAmount,
        "Current Sale": totals.CurrentSale,
        "Handover Amount": totals.HandoverAmount,
        "Closing Amount": totals.ClosingAmount,
      });

      const headers = Object.keys(exportRows[0]);
      const numericHeaders = new Set([
        "Opening Amount",
        "Current Sale",
        "Handover Amount",
        "Closing Amount",
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
                return buildCell(excelRowIndex, columnIndex, Number(value) || 0, false);
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
    <sheet name="Projection History" sheetId="1" r:id="rId1"/>
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
      const safeUserId = (userId || "collector").replace(/[^\w-]+/g, "-");
      const dateLabel = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `collector-projection-history-${safeUserId}-${dateLabel}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return createPortal(
    <div className="app-modal-overlay" onClick={onClose}>
      <div
        className="app-modal"
        style={{ maxWidth: "960px" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">Collector Projection Last 7 Days</h2>
            <p className="app-modal-subtitle">
              {userName || "Collector"} ({userId || "-"})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-modal-body">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-600">
              Loading last 7 days data...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-600">
              No projection data found.
            </div>
          ) : (
            <div className="app-table-shell max-h-[60vh] overflow-auto rounded-lg border border-slate-200">
              <table className="app-table min-w-full divide-y divide-gray-200 text-sm">
                <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="border-b border-slate-200 bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                  {rows.map((row, index) => (
                    <tr key={`${row.ReportDate}-${index}`}>
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="whitespace-nowrap px-4 py-3 text-slate-700"
                        >
                          {renderValue(row, column.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-10 bg-slate-100">
                  <tr>
                    <td className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      Total
                    </td>
                    <td className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
                      Rs {formatIndianNumber(totals.OpeningAmount)}
                    </td>
                    <td className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
                      Rs {formatIndianNumber(totals.CurrentSale)}
                    </td>
                    <td className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
                      Rs {formatIndianNumber(totals.HandoverAmount)}
                    </td>
                    <td className="border-t border-slate-300 bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
                      Rs {formatIndianNumber(totals.ClosingAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="app-modal-actions">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={loading || exporting || !rows.length}
            className="app-button-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
          <button type="button" onClick={onClose} className="app-button-secondary">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
