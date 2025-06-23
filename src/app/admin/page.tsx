
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the TaskFlow Admin Panel.</p>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Overview
            </CardTitle>
            <CardDescription>
              Here is a quick overview of your application. More stats and management tools are coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">User, Task, and Team statistics will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
