import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  KanbanSquare,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "./ProfileAvatar";

interface ResponsiveSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function ResponsiveSidebar({ isCollapsed, setIsCollapsed }: ResponsiveSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile, setIsCollapsed]);

  const navItems = [
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  ];

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const sidebarClass = cn(
    "h-screen border-r bg-card flex flex-col fixed left-0 top-0 z-30 shadow-xl shadow-black/5 transition-all duration-300 ease-in-out",
    sidebarWidth,
    isMobile && !isMobileMenuOpen && "-translate-x-full",
    isMobile && isMobileMenuOpen && "w-64"
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClass}>
        {/* Header */}
        <div className={cn("p-6 border-b border-border/50", isCollapsed && !isMobile && "p-3")}>
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center justify-center", isCollapsed && !isMobile && "w-full")}>
              <img
                src="/Malaica-Logo-2025-01-1536x795.png"
                alt="Malaica Logo"
                className={cn(
                  "object-contain transition-all duration-300",
                  isCollapsed && !isMobile ? "h-8 w-8" : "h-12 w-auto"
                )}
              />
            </div>
            
            {/* Desktop Collapse Button */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          
          {(!isCollapsed || isMobile) && (
            <p className="text-xs text-muted-foreground text-center mt-2 transition-opacity duration-300">
              Content Calendar
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed && !isMobile && "justify-center px-2"
                  )}
                  title={isCollapsed && !isMobile ? item.label : undefined}
                >
                  <item.icon 
                    className={cn(
                      "w-5 h-5 shrink-0", 
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                    )} 
                  />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-opacity duration-300">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-border/50">
          <div className={cn(
            "bg-muted/50 rounded-xl p-4 transition-all duration-300",
            isCollapsed && !isMobile && "p-2"
          )}>
            <ProfileAvatar isCollapsed={isCollapsed && !isMobile} />
          </div>
        </div>
      </div>
    </>
  );
}