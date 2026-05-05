import React, { useState } from "react";

function LogoMark({ size = "md", showText = true, subtitle = "" }) {
  const [logoFailed, setLogoFailed] = useState(false);

  const sizeClass = size === "lg" ? "h-12 w-12" : "h-11 w-11";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200`}
      >
        {!logoFailed ? (
          <img
            src="/logo.png"
            alt="SmartMeal"
            loading="eager"
            onError={() => setLogoFailed(true)}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900 text-white">
            SM
          </span>
        )}
      </div>

      {showText ? (
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
            SmartMeal
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default LogoMark;