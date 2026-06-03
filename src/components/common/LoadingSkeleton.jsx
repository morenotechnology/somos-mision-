export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function ContentCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col">
      <SkeletonBox className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBox className="h-3 w-1/3" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-3 w-4/5" />
        <SkeletonBox className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <SkeletonBox className="h-8 flex-1 rounded-xl" />
          <SkeletonBox className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-7 w-16" />
          <SkeletonBox className="h-3 w-24" />
        </div>
        <SkeletonBox className="w-10 h-10 rounded-2xl" />
      </div>
    </div>
  );
}

export function RankingCardSkeleton() {
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <SkeletonBox className="w-8 h-8 rounded-full" />
      <SkeletonBox className="w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBox className="h-4 w-36" />
        <SkeletonBox className="h-3 w-24" />
      </div>
      <SkeletonBox className="h-4 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <SkeletonBox className="w-10 h-10 rounded-full" />
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
