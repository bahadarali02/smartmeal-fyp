import React from "react";
import { Link } from "react-router-dom";

function EmptyIcon({ type = "default" }) {
  const common = "h-8 w-8";

  const icons = {
    meals: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 11h16M6 11a6 6 0 0 1 12 0M7 16h10M9 20h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M7 4h10l2 4v12H5V8l2-4ZM5 8h14M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    favorites: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a6 6 0 0 1 12 0M17 10a3 3 0 1 0 0-6M16 21a5 5 0 0 1 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    default: (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M5 5h14v14H5V5ZM8 9h8M8 13h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type] || icons.default;
}

function EmptyState({
  type = "default",
  title = "Nothing found",
  message = "There is no data to display right now.",
  actionLabel = "",
  actionPath = "",
  className = "",
}) {
  return (
    <div
      className={`rounded-[30px] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-8 ${className}`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm">
        <EmptyIcon type={type} />
      </div>

      <p className="mt-5 text-lg font-semibold text-slate-900">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      {actionLabel && actionPath ? (
        <Link to={actionPath} className="btn-primary mt-5 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export default EmptyState;