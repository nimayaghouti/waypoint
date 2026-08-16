import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex items-center justify-center">
              <div className="flex flex-col gap-4 items-center w-fit mx-auto">
                <Skeleton className="size-36 rounded-full" />
                <div className="flex items-center justify-center gap-1 mx-auto">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-32 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="flex items-center gap-1.5 mt-1">
                  <Skeleton className="size-3.5 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between flex-wrap gap-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-destructive/20 bg-destructive/5">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-2">
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-9 w-36 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
