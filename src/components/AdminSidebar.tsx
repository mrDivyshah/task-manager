
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ListTodo, Milestone } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  // { name: "Users", href: "/admin/users", icon: Users },
  // { name: "Tasks", href: "/admin/tasks", icon: ListTodo },
  // { name: "Teams", href: "/admin/teams", icon: Milestone },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 pr-8 border-r border-border/50 pt-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Admin Menu</h2>
      <nav className="flex flex-col space-y-1">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === link.href && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
