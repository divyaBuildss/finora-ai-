
export default function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />
  );
}

// Named composite skeleton for stat cards grid
export function StatCardSkeleton() {
  return (
    <div className="stat-card rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-2.5 w-20" rounded="rounded-full" />
          <Skeleton className="h-7 w-32" rounded="rounded-lg" />
        </div>
        <Skeleton className="h-10 w-10 flex-shrink-0 ml-3" rounded="rounded-xl" />
      </div>
      <div className="divider-gradient" />
      <Skeleton className="h-2.5 w-24" rounded="rounded-full" />
    </div>
  );
}

// Named composite skeleton for list rows
export function RowSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-8 w-8 flex-shrink-0" rounded="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" rounded="rounded-full" />
            <Skeleton className="h-2.5 w-1/2" rounded="rounded-full" />
          </div>
          <Skeleton className="h-5 w-16" rounded="rounded-full" />
        </div>
      ))}
    </div>
  );
}
