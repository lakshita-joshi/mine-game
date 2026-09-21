import React from "react";

export default function Skeleton({ className = "", rounded = "rounded-xl" }) {
  return (
    <div
      className={`shimmer-bg ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-rim bg-elevated p-5">
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" rounded="rounded-md" />
      <Skeleton className="h-3 w-1/2" rounded="rounded-md" />
    </div>
  );
}
