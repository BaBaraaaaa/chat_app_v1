import { Box, Drawer, IconButton, AppBar, Toolbar, Typography, Badge } from '@mui/material';
import {
  Menu as MenuIcon,
  Chat,
  People,
  Notifications,
  Settings,
  Close,
} from '@mui/icons-material';
import { useState } from 'react';

interface MobileNavigationProps {
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
}

export default function MobileNavigationMui({
  activeView,
  onViewChange,
  notificationCount = 0,
}: MobileNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { id: 'chat' as const, label: 'Chat', icon: <Chat /> },
    { id: 'friends' as const, label: 'Bạn bè', icon: <People /> },
    {
      id: 'notifications' as const,
      label: 'Thông báo',
      icon: (
        <Badge badgeContent={notificationCount} color="error">
          <Notifications />
        </Badge>
      ),
    },
    { id: 'settings' as const, label: 'Cài đặt', icon: <Settings /> },
  ];

  return (
    <>
      {/* Mobile AppBar */}
      <AppBar position="sticky" sx={{ display: { xs: 'block', md: 'none' } }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => item.id === activeView)?.label}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ p: 2 }}>
            {menuItems.map((item) => (
              <Box
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setDrawerOpen(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: activeView === item.id ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {item.icon}
                <Typography>{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
