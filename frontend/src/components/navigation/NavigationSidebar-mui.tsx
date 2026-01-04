import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, Tooltip, Avatar, Divider } from '@mui/material';
import {
  Chat,
  People,
  Notifications,
  Settings,
  Logout,
} from '@mui/icons-material';
import { Badge } from '@mui/material';
import { ThemeToggleButton } from '@/components/theme/ThemeToggleButton';
import { useAuthStore } from '@/stores/useAuthStore';

interface NavigationSidebarProps {
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
  onViewChange: (view: 'chat' | 'friends' | 'settings' | 'notifications') => void;
  notificationCount?: number;
  unreadMessageCount?: number;
}

export default function NavigationSidebarMui({
  activeView,
  onViewChange,
  notificationCount = 0,
  unreadMessageCount = 0,
}: NavigationSidebarProps) {
  const { user, signOut } = useAuthStore();
  const menuItems = [
    {
      id: 'chat' as const,
      icon: (
        <Badge badgeContent={unreadMessageCount} color="error">
          <Chat />
        </Badge>
      ),
      tooltip: 'Tin nhắn'
    },
    { id: 'friends' as const, icon: <People />, tooltip: 'Bạn bè' },
    {
      id: 'notifications' as const,
      icon: (
        <Badge badgeContent={notificationCount} color="error">
          <Notifications />
        </Badge>
      ),
      tooltip: 'Thông báo',
    },
    { id: 'settings' as const, icon: <Settings />, tooltip: 'Cài đặt' },
  ];

  return (
    <Box
      sx={{
        width: 80,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ mb: 3 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >

        </Avatar>
      </Box>

      <Divider sx={{ width: '70%', mb: 2 }} />

      {/* Menu Items */}
      <List sx={{ flex: 1, width: '100%', px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <Tooltip title={item.tooltip} placement="right">
              <ListItemButton
                selected={activeView === item.id}
                onClick={() => onViewChange(item.id)}
                sx={{
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: 56,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: activeView === item.id ? 'inherit' : 'text.primary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ width: '70%', mb: 2 }} />

      {/* Bottom Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Theme Toggle */}
        <ThemeToggleButton />

        {/* User Profile */}
        <Tooltip title={user?.displayName || 'User Profile'} placement="right">
          <IconButton
            sx={{
              width: 48,
              height: 48,
              p: 0,
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              alt={user?.displayName}
              sx={{ width: 48, height: 48 }}
            >
              {user?.displayName?.[0] || user?.username?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Logout */}
        <Tooltip title="Đăng xuất" placement="right">
          <IconButton onClick={signOut} color="error">
            <Logout />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
