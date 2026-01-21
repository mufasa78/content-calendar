import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  User,
  Settings,
  LogOut,
  Calendar,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileAvatarProps {
  isCollapsed?: boolean;
}

export function ProfileAvatar({ isCollapsed = false }: ProfileAvatarProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-lg p-2 w-full justify-start",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                
                <div className="shrink-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Calendar Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}