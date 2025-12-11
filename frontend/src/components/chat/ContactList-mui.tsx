import { List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Badge, Typography, Box } from '@mui/material';
import type { Contact } from '@/types/chat';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
}

export default function ContactListMui({ contacts, selectedContact, onContactSelect }: ContactListProps) {
  return (
    <List sx={{ p: 0 }}>
      {contacts.map((contact) => (
        <ListItem key={contact.id} disablePadding>
          <ListItemButton
            selected={selectedContact?.id === contact.id}
            onClick={() => onContactSelect(contact)}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderLeft: 3,
                borderColor: 'primary.main',
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: contact.isOnline ? 'success.main' : 'grey.400',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: 2,
                    borderColor: 'background.paper',
                  },
                }}
              >
                <Avatar src={contact.avatarUrl} alt={contact.name}>
                  {contact.name[0]}
                </Avatar>
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {contact.name}
                  </Typography>
                  {contact.timestamp && (
                    <Typography variant="caption" color="text.secondary">
                      {contact.timestamp}
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {contact.lastMessage}
                  </Typography>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <Badge
                      badgeContent={contact.unreadCount}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
