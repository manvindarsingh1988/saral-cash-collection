import React from "react";
import Tooltip from "./Tooltip";

export default function TruncatedCell({
  children,
  title,
  className = "",
}) {
  const computedTitle =
    title ??
    (typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined);

  return (
    <Tooltip content={computedTitle} className="block max-w-full">
      <div
        className={`max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
      >
        {children}
      </div>
    </Tooltip>
  );
}
