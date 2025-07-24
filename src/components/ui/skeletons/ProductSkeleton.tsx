import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-xs">
              <div className="p-0">
                <Skeleton className="h-40 w-full rounded-t-lg" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}