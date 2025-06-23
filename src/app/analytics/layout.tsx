import { Header } from "@/components/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnalyticsSidebar } from "./AnalyticsSidebar";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <AnalyticsSidebar />
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </SidebarInset>
        </div>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">
          © 2025 TaskFlow. Developed By Dravya shah
        </footer>
      </div>
    </SidebarProvider>
  );
}
