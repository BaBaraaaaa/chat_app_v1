import { Box } from '@mui/material';
import NavigationSidebarMui from '../navigation/NavigationSidebar-mui';
import MobileNavigationMui from '../navigation/MobileNavigation-mui';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
}

export default function LayoutMui({ children, activeView, onViewChange, notificationCount }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop Navigation */}
      <NavigationSidebarMui
        activeView={activeView}
        onViewChange={onViewChange}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Navigation */}
        <MobileNavigationMui
          activeView={activeView}
          onViewChange={onViewChange}
          notificationCount={notificationCount}
        />

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
