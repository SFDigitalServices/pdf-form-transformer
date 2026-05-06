'use client';

export function SkeletonLoader() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="Extracting questions…"
      aria-busy="true"
    >
      <div className="h-10 bg-gray-200 rounded animate-pulse w-2/3" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
      ))}
      <div className="h-9 bg-gray-200 rounded animate-pulse w-36 ml-auto" />
      <span className="sr-only">Please wait while questions are extracted.</span>
    </div>
  );
}
