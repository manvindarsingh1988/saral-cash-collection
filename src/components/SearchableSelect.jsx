import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
  buttonClassName = "",
  panelClassName = "",
  emptyMessage = "No matching options found.",
}) {
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) => ({
        ...option,
        value: String(option.value ?? ""),
        label: option.label ?? String(option.value ?? ""),
        searchText: `${option.label ?? ""} ${option.value ?? ""} ${option.searchText ?? ""}`.toLowerCase(),
      })),
    [options]
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === String(value ?? "")
  );

  const filteredOptions = normalizedOptions.filter((option) =>
    option.searchText.includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const updatePanelPosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideTrigger = wrapperRef.current?.contains(event.target);
      const clickedInsidePanel = panelRef.current?.contains(event.target);

      if (!clickedInsideTrigger && !clickedInsidePanel) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-left text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${buttonClassName}`}
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && panelStyle
        ? createPortal(
            <div
              ref={panelRef}
              style={panelStyle}
              className={`rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ${panelClassName}`}
            >
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm"
                  autoFocus
                />
              </div>

              <div className="max-h-64 overflow-auto rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
                >
                  <span>{placeholder}</span>
                  {!selectedOption ? <Check className="h-4 w-4 text-blue-600" /> : null}
                </button>

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = option.value === String(value ?? "");
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                          isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-500">{emptyMessage}</div>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
