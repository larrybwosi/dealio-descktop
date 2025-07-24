import { Skeleton } from "@/components/ui/skeleton";

export function OrderQueueSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center p-4 rounded-lg border bg-card">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-1/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="ml-4">
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}