import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64 sm:w-96 max-w-full" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[75vh] lg:min-h-150">
        <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="flex-1 bg-muted/10 border border-border/50 rounded-xl py-4 px-4 flex flex-col gap-3">
            <Skeleton className="h-4 w-28 mb-2" />

            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="p-3 border rounded-xl bg-card flex justify-between items-center gap-2"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
                <Skeleton className="size-7 rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-2/3 aspect-square sm:aspect-4/2 lg:aspect-auto lg:h-full border border-border/50 rounded-xl overflow-hidden shadow-sm relative">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      </div>
    </div>
  );
}
