import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  KanbanSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function SidebarNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  ];

  return (
    <div className="w-64 h-screen border-r bg-card flex flex-col fixed left-0 top-0 z-20 shadow-xl shadow-black/5">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-center">
          <img
            src="/Malaica-Logo-2025-01-1536x795.png"
            alt="Malaica Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Content Calendar</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
            showName={true}
          />
          <div className="flex-1 min-w-0 ml-2">
            <p className="text-sm font-semibold truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
