import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Users,
  Settings,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface NavigationSidebarProps {
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
}

const NavigationSidebar = ({ 
  activeView, 
  onViewChange, 
  notificationCount = 0 
}: NavigationSidebarProps) => {
  const { user } = useAuthStore();

  const navigationItems = [
    {
      id: 'chat' as const,
      icon: MessageCircle,
      label: 'Trò chuyện',
    },
    {
      id: 'friends' as const,
      icon: Users,
      label: 'Bạn bè',
    },
    {
      id: 'notifications' as const,
      icon: Bell,
      label: 'Thông báo',
      badge: notificationCount > 0 ? notificationCount : undefined,
    },
    {
      id: 'settings' as const,
      icon: Settings,
      label: 'Cài đặt',
    },
  ];

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 h-full">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              size="icon"
              className="w-12 h-12 relative"
              onClick={() => onViewChange(item.id)}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2">
        {/* Theme Toggle */}
        <ThemeToggle className="w-12 h-12" />

        {/* User Profile */}
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 p-0"
          title={user?.displayName || 'User Profile'}
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {user?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;