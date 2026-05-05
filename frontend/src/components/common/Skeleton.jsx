import React from "react";

function Skeleton({
  className = "",
  rounded = "rounded-2xl",
  children = null,
}) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function SkeletonLine({ className = "" }) {
  return <Skeleton className={`h-3 ${className}`} rounded="rounded-full" />;
}

function SkeletonCircle({ className = "" }) {
  return <Skeleton className={className} rounded="rounded-full" />;
}

function SkeletonCard({ image = true }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      {image ? <Skeleton className="aspect-[4/3] w-full" rounded="rounded-none" /> : null}

      <div className="space-y-4 p-5">
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />

        <div className="flex items-center gap-3 pt-2">
          <SkeletonCircle className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          <SkeletonLine className="w-24" />
          <Skeleton className="h-10 w-20" rounded="rounded-xl" />
        </div>

        <Skeleton className="h-12 w-12" rounded="rounded-2xl" />
      </div>

      <div className="mt-5 space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
      </div>
    </div>
  );
}

function SkeletonTableRows({ rows = 4 }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4 px-6 py-5 sm:grid-cols-[48px_1fr_auto] sm:items-center"
        >
          <SkeletonCircle className="h-12 w-12" />

          <div className="space-y-3">
            <SkeletonLine className="w-40 max-w-full" />
            <SkeletonLine className="w-56 max-w-full" />
          </div>

          <Skeleton className="h-7 w-24" rounded="rounded-full" />
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonLine,
  SkeletonCircle,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTableRows,
};