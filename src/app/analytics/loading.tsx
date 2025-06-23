
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                  <Skeleton className="h-9 w-48 rounded-lg" />
                  <Skeleton className="h-5 w-72 rounded-lg" />
              </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card className="xl:col-span-2">
              <CardHeader>
                 <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                 <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-72 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                 <Skeleton className="h-6 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-72 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © 2025 TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}
