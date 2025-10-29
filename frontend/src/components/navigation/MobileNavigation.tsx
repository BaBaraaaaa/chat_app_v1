import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import NavigationSidebar from "@/components/navigation/NavigationSidebar";

interface MobileNavigationProps {
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
}

const MobileNavigation = ({ 
  activeView, 
  onViewChange, 
  notificationCount = 0 
}: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewChange = (view: 'chat' | 'friends' | 'settings' | 'notifications') => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">ChatApp</h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-16">
              <NavigationSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                notificationCount={notificationCount}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;