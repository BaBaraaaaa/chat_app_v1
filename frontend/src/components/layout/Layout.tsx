import type { ReactNode } from "react";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";

interface LayoutProps {
  children: ReactNode;
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
}

const Layout = ({ 
  children, 
  activeView, 
  onViewChange, 
  notificationCount = 0 
}: LayoutProps) => {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationSidebar
          activeView={activeView}
          onViewChange={onViewChange}
          notificationCount={notificationCount}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;