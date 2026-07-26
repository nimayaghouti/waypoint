import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function PollCardSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/10 bg-muted/10">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </CardContent>

      <CardFooter className="p-4 flex items-center justify-between gap-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </CardFooter>
    </Card>
  );
}

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
        <PollCardSkeleton />
        <PollCardSkeleton />
        <PollCardSkeleton />
      </div>
    </div>
  );
}
