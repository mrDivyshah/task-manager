
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl animate-pulse">
          <CardHeader className="space-y-4">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <Skeleton className="h-9 w-24 rounded-md" />
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Skeleton className="h-10 w-full sm:w-36 rounded-md" />
                    <Skeleton className="h-10 w-full sm:w-44 rounded-md" />
                </div>
            </div>
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-5 w-3/4 rounded-lg" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="shadow-md rounded-lg flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-7 w-2/3 rounded-lg" />
                        <div className="flex gap-2">
                           <Skeleton className="h-9 w-20 rounded-md" />
                           <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                    </div>
                     <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
                     <Skeleton className="h-3 w-1/3 mt-2 rounded-lg" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-5 w-1/4 mb-3" />
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
