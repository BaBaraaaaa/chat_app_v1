import { Box, Typography, Stack, Paper, Badge } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

export default function NotificationsPanelMui() {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Paper sx={{ p: 3, m: 2, borderRadius: 2 }} elevation={2}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={0} color="error">
              <NotificationsIcon color="primary" />
            </Badge>
            <Typography variant="h5" fontWeight={600}>
              Thông báo
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              Không có thông báo mới
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
