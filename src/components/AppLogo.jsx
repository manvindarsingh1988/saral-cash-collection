import React from "react";

export default function AppLogo({
  variant = "nav",
  showWordmark = false,
  className = "",
}) {
  const sizeClass =
    variant === "auth"
      ? "h-36 w-auto sm:h-40"
      : "h-11 w-auto sm:h-12";
  const wrapperClass =
    variant === "auth"
      ? ""
      : "rounded-lg border border-white/20 bg-white/95 px-1.5 py-0.5 shadow-md shadow-slate-900/10 backdrop-blur";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={wrapperClass}>
        <img
          src="/branding/saral-logo.png"
          alt="Saral Cash Flow"
          className={`${sizeClass} object-contain`}
        />
      </div>
      {showWordmark ? (
        <span className="text-white text-xl font-bold tracking-tight">
          Saral Cash Flow
        </span>
      ) : null}
    </div>
  );
}
