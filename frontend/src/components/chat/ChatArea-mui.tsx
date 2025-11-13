import { Box, Avatar, Typography, IconButton, Divider } from '@mui/material';
import { MoreVert, VideoCall, Phone } from '@mui/icons-material';
import type { Contact } from '@/types/chat';
import type { Message } from '@/types/chat';
import MessageListMui from './MessageList-mui';
import MessageInputMui from './MessageInput-mui';

interface ChatAreaProps {
  selectedContact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isFriend: boolean;
  isActive: boolean;
}

export default function ChatAreaMui({
  selectedContact,
  messages,
  onSendMessage,
  isFriend,
  isActive,
}: ChatAreaProps) {
  if (!selectedContact) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Avatar src={selectedContact.avatar} sx={{ mr: 2 }}>
          {selectedContact.name[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {selectedContact.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedContact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </Typography>
        </Box>
        <IconButton size="small">
          <Phone />
        </IconButton>
        <IconButton size="small">
          <VideoCall />
        </IconButton>
        <IconButton size="small">
          <MoreVert />
        </IconButton>
      </Box>

      <Divider />

      {/* Messages */}
      <MessageListMui messages={messages} />

      {/* Input */}
      <MessageInputMui 
        onSendMessage={onSendMessage} 
        disabled={!isFriend || !isActive}
      />
    </Box>
  );
}
