import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="w-full max-w-3xl mx-auto space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64 sm:w-80 max-w-full" />
      </div>

      <div className="flex flex-col w-full max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Skeleton className="h-8 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <div className="flex gap-1">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>

        <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`weekday-${i}`} className="py-3 flex justify-center">
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-border/30 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={`day-${i}`}
                className="aspect-4/3 bg-card flex flex-col items-center"
              >
                <Skeleton className="h-5 w-5 mt-2 rounded-sm" />{' '}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
