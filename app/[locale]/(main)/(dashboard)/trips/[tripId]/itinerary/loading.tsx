import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-pulse">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-4 w-full sm:w-auto flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64 sm:w-80 max-w-full" />
        </div>

        <Skeleton className="h-8 w-34 ms-auto rounded-md shrink-0" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
