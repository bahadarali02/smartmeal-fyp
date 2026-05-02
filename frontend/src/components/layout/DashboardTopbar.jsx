import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getFullImageUrl } from "../../services/uploadService";

function NotificationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M18 9a6 6 0 0 0-12 0v4l-2 3h16l-2-3V9ZM10 20h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardTopbar({
  title = "Dashboard",
  subtitle = "",
  actionLabel = "",
  actionPath = "",
}) {
  const location = useLocation();

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("smartmealUser")) || null;
  }, [location.pathname]);

  const profileImageSrc = savedUser?.profileImageUrl
    ? getFullImageUrl(savedUser.profileImageUrl)
    : "";

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold capitalize text-slate-500">
              {savedUser?.role || "workspace"}
            </span>

            <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-300 sm:block" />

            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              SmartMeal dashboard
            </span>
          </div>

          <h2 className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actionLabel && actionPath ? (
            <Link
              to={actionPath}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              {actionLabel}
              <ArrowIcon />
            </Link>
          ) : null}

          <Link
            to="/notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            aria-label="Notifications"
          >
            <NotificationIcon />
          </Link>

          <Link
            to="/profile"
            className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 sm:px-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt={savedUser?.name || "User"}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                (savedUser?.name || "SM").slice(0, 2).toUpperCase()
              )}
            </div>

            <span className="hidden max-w-[140px] truncate sm:block">
              {savedUser?.name || "User"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardTopbar;