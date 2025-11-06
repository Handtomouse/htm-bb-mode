interface BBSkeletonProps {
  className?: string;
}

export function BBSkeleton({ className = "" }: BBSkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/10 ${className}`} />
  );
}

export function BBSkeletonCard() {
  return (
    <div className="border border-white/10 bg-black/30 p-4">
      <BBSkeleton className="mb-3 h-32" />
      <BBSkeleton className="mb-2 h-4 w-3/4" />
      <BBSkeleton className="h-3 w-1/2" />
    </div>
  );
}

export function BBSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-white/10 bg-black/30 p-3">
          <BBSkeleton className="mb-2 h-4 w-2/3" />
          <BBSkeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
