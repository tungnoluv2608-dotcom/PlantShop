interface ProductCardSkeletonProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <div className="h-[380px] overflow-hidden rounded-2xl border border-border/80 bg-card animate-pulse">
      <div className="aspect-square bg-secondary/30" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-secondary/30 rounded w-3/4" />
        <div className="h-5 bg-secondary/30 rounded w-1/3" />
        <div className="h-10 bg-secondary/30 rounded" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ count = 6 }: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  );
}

export function CategoryCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col items-center animate-pulse">
          <div className="mb-4 h-32 w-32 rounded-full bg-secondary/30 md:h-40 md:w-40" />
          <div className="h-4 w-20 bg-secondary/30 rounded" />
        </div>
      ))}
    </>
  );
}

export function BlogCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card animate-pulse">
          <div className="aspect-[16/10] bg-secondary/30" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-secondary/30 rounded w-1/4" />
            <div className="h-5 bg-secondary/30 rounded w-3/4" />
            <div className="h-4 bg-secondary/30 rounded w-full" />
            <div className="h-4 bg-secondary/30 rounded w-2/3" />
          </div>
        </div>
      ))}
    </>
  );
}
