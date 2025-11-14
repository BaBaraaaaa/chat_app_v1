import { Box, Tabs, Tab, TextField, InputAdornment, Badge } from '@mui/material';
import { Search, PersonAdd, HowToReg, Send } from '@mui/icons-material';

interface FriendsSidebarProps {
  activeTab: 'all' | 'received' | 'sent';
  onTabChange: (tab: 'all' | 'received' | 'sent') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  receivedCount: number;
  sentCount: number;
}

export default function FriendsSidebarMui({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  receivedCount,
  sentCount,
}: FriendsSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, value) => onTabChange(value)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          icon={<PersonAdd />}
          iconPosition="start"
          label="Tất cả"
          value="all"
        />
        <Tab
          icon={
            <Badge badgeContent={receivedCount} color="error">
              <HowToReg />
            </Badge>
          }
          iconPosition="start"
          label="Nhận"
          value="received"
        />
        <Tab
          icon={
            <Badge badgeContent={sentCount} color="info">
              <Send />
            </Badge>
          }
          iconPosition="start"
          label="Đã gửi"
          value="sent"
        />
      </Tabs>
    </Box>
  );
}
