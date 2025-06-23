
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Pie Skeleton */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="mx-auto h-48 w-48 rounded-full" />
            </CardContent>
        </Card>
        {/* Trend Line Skeleton */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[216px] w-full rounded-lg" />
            </CardContent>
        </Card>
        {/* Categories Bar Skeleton */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[340px] w-full rounded-lg" />
            </CardContent>
        </Card>
        {/* Priority Pie Skeleton */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                 <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="mx-auto h-48 w-48 rounded-full" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
