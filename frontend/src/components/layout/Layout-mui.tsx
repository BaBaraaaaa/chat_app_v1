import { Box, useTheme, useMediaQuery } from '@mui/material';
import NavigationSidebarMui from '../navigation/NavigationSidebar-mui';
import MobileNavigationMui from '../navigation/MobileNavigation-mui';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
  unreadMessageCount?: number;
}

export default function LayoutMui({ children, activeView, onViewChange, notificationCount, unreadMessageCount }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Desktop Navigation */}
      {!isMobile && (
        <NavigationSidebarMui
          activeView={activeView}
          onViewChange={onViewChange}
          notificationCount={notificationCount}
          unreadMessageCount={unreadMessageCount}
        />
      )}

      {/* Main Content */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: { xs: 'calc(100vh - 64px)', md: '100vh' } // Account for mobile AppBar
      }}>
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNavigationMui
            activeView={activeView}
            onViewChange={onViewChange}
            notificationCount={notificationCount}
            unreadMessageCount={unreadMessageCount}
          />
        )}

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
