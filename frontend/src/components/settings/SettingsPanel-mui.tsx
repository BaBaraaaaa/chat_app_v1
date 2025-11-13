import { Box, Typography, Stack, Paper, Divider, List, ListItem, ListItemText, Switch } from '@mui/material';
import { Settings as SettingsIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/theme/useTheme';

export default function SettingsPanelMui() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Paper sx={{ p: 3, m: 2, borderRadius: 2 }} elevation={2}>
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              Cài đặt
            </Typography>
          </Box>

          <Divider />

          {/* Settings List */}
          <List>
            {/* Dark Mode Toggle */}
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                {mode === 'light' ? <Brightness7 /> : <Brightness4 />}
              </Box>
              <ListItemText 
                primary="Chế độ tối" 
                secondary={mode === 'light' ? 'Sáng' : 'Tối'}
              />
              <Switch 
                checked={mode === 'dark'} 
                onChange={toggleTheme}
              />
            </ListItem>
          </List>
        </Stack>
      </Paper>
    </Box>
  );
}
