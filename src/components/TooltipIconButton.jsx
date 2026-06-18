import React from "react";
import Tooltip from "./Tooltip";

export default function TooltipIconButton({
  label,
  className = "",
  children,
  ...props
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
