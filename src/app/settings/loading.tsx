
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-xl animate-pulse">
          <CardHeader>
            <Skeleton className="h-9 w-24 mb-4" />
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <Skeleton className="h-6 w-1/3 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            <div>
              <Skeleton className="h-6 w-1/3 mb-3" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-6 w-1/2 mt-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            <div>
              <Skeleton className="h-6 w-1/3 mb-3" />
              <div className="space-y-4 mt-2">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
        © 2025 TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}
