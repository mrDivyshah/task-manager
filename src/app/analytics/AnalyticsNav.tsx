
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Dashboard", href: "/analytics", icon: BarChart },
    { name: "Timeline", href: "/analytics/timeline", icon: Clock },
  ];

  return (
    <div className="border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 -mb-px flex space-x-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.name} href={tab.href} className={cn(
              "group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm",
              isActive 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}>
                <tab.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  );
}
