
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimelineLoading() {
  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
                <Skeleton className="h-9 w-48 rounded-lg" />
                <Skeleton className="h-5 w-72 rounded-lg" />
            </div>
        </div>

        <Card className="col-span-full">
            <CardHeader>
                <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-32 w-full rounded-lg mb-6" />
                <Skeleton className="h-6 w-1/3 mb-4 rounded-md" />
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
