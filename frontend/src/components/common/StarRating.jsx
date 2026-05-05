import React from "react";

function StarIcon({ filled = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={className}
      aria-hidden="true"
    >
      <path
        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({
  rating = 0,
  size = "sm",
  showValue = true,
  showCount = false,
  count = 0,
  interactive = false,
  onChange,
  className = "",
}) {
  const numericRating = Number(rating || 0);
  const roundedRating = Math.round(numericRating);

  const sizeClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= roundedRating;

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange?.(star)}
                className="rounded-lg p-0.5 text-amber-500 transition duration-200 hover:-translate-y-0.5 hover:text-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-100"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <StarIcon filled={filled} className={sizeClass} />
              </button>
            );
          }

          return <StarIcon key={star} filled={filled} className={sizeClass} />;
        })}
      </div>

      {showValue ? (
        <span className="text-xs font-semibold text-slate-700">
          {numericRating > 0 ? numericRating.toFixed(1) : "No rating"}
        </span>
      ) : null}

      {showCount ? (
        <span className="text-xs font-medium text-slate-400">
          ({Number(count || 0)} review{Number(count || 0) === 1 ? "" : "s"})
        </span>
      ) : null}
    </div>
  );
}

export default StarRating;