import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import type { Contact } from '@/types/chat';
import ContactListMui from './ContactList-mui';

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebarMui({
  contacts,
  selectedContact,
  onContactSelect,
  searchQuery,
  onSearchChange,
  onNewChat,
}: ChatSidebarProps) {
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
          placeholder="Tìm kiếm cuộc trò chuyện..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onNewChat}>
                  <Add fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Contact List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <ContactListMui
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={onContactSelect}
        />
      </Box>
    </Box>
  );
}
