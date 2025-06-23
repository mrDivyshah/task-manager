
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded-lg" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg rounded-2xl">
              <CardHeader>
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px]">
                  <Skeleton className="w-full h-full rounded-lg" />
              </CardContent>
          </Card>

          <Card className="lg:col-span-1 shadow-lg rounded-2xl">
              <CardHeader>
                  <Skeleton className="h-6 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px] sm:h-[350px]">
                  <Skeleton className="w-48 h-48 rounded-full" />
              </CardContent>
          </Card>

          <Card className="lg:col-span-3 shadow-lg rounded-2xl">
              <CardHeader>
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
              </CardHeader>
              <CardContent className="h-[350px] sm:h-[400px]">
                 <Skeleton className="w-full h-full rounded-lg" />
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
