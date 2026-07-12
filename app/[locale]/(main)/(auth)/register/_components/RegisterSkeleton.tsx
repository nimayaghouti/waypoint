import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterSkeleton() {
  return (
    <Card className="border-border/50 shadow-lg w-full bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4 pt-8">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6 mt-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-20 w-full mt-4 rounded-xl" />
        <Skeleton className="h-10 w-full mt-8" />
      </CardContent>
      <CardFooter className="justify-center border-t border-border/50 pt-6 pb-6">
        <Skeleton className="h-4 w-2/3" />
      </CardFooter>
    </Card>
  );
}
