import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  content,
  children,
  className = "",
  panelClassName = "",
  placement = "top",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const element = wrapperRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const top = placement === "bottom" ? rect.bottom + 10 : rect.top - 10;

      setPosition({
        top,
        left: rect.left + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, placement]);

  if (!content) {
    return <span className={className}>{children}</span>;
  }

  return (
    <>
      <span
        ref={wrapperRef}
        className={className}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className={`app-tooltip ${placement === "bottom" ? "app-tooltip-bottom" : "app-tooltip-top"} ${panelClassName}`}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              {content}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
