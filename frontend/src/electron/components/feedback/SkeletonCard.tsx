export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-[var(--spacing-lg)] shadow-medium border border-gray-200 animate-pulse">
      <div className="space-y-[var(--spacing-lg)]">
        {/* Title */}
        <div className="h-[var(--spacing-12)] bg-shimmer rounded w-3/4 animate-shimmer"
          style={{ backgroundSize: '200% 100%' }} />

        {/* Lines */}
        <div className="space-y-[var(--spacing-md)]">
          <div className="h-[var(--spacing-10)] bg-shimmer rounded animate-shimmer"
            style={{ backgroundSize: '200% 100%' }} />
          <div className="h-[var(--spacing-10)] bg-shimmer rounded w-5/6 animate-shimmer"
            style={{ backgroundSize: '200% 100%' }} />
          <div className="h-[var(--spacing-10)] bg-shimmer rounded w-4/6 animate-shimmer"
            style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-[var(--spacing-10)] bg-shimmer rounded animate-shimmer"
      style={{ width, backgroundSize: '200% 100%' }}
    />
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-lg)]">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
