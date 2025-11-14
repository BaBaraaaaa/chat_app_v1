import { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Phone, 
  VideoCall, 
  MoreVert, 
  Person, 
  Search, 
  Archive,
  ChatBubbleOutline,
  PersonAdd,
  Group 
} from '@mui/icons-material';
import MessageListMui from './MessageList-mui';
import MessageInputMui from './MessageInput-mui';
import type { Contact } from '@/types/chat';
import type { Message } from '@/types/message';
import { toast } from 'sonner';
import { useMessageStore } from '@/stores/useMessageStore';

interface ChatAreaProps {
  selectedContact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isFriend?: boolean;
  isActive?: boolean;
}

export default function ChatAreaMui({ 
  selectedContact, 
  messages, 
  onSendMessage,
  isFriend = true,
  isActive = true 
}: ChatAreaProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const { editMessage, deleteMessage } = useMessageStore();
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  // Handle save edited message
  const handleSaveEdit = (content: string) => {
    if (editingMessageId && content.trim()) {
      editMessage(editingMessageId, content.trim());
      setEditingMessageId(null);
      setEditingContent('');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Handle send or edit
  const handleSendOrEdit = (content: string) => {
    if (editingMessageId) {
      handleSaveEdit(content);
    } else {
      onSendMessage(content);
    }
  };

  // Menu actions
  const handleCallPhone = () => { 
    toast.warning('Chức năng gọi điện thoại đang được phát triển'); 
    handleMenuClose();
  };
  const handleCallVideo = () => { 
    toast.warning('Chức năng gọi video đang được phát triển'); 
    handleMenuClose();
  };
  const handleViewProfile = () => { 
    toast.warning('Chức năng xem hồ sơ đang được phát triển'); 
    handleMenuClose();
  };
  const handleSearch = () => { 
    toast.warning('Chức năng tìm kiếm tin nhắn đang được phát triển'); 
    handleMenuClose();
  };
  const handleArchive = () => { 
    toast.warning('Chức năng lưu trữ tin nhắn đang được phát triển'); 
    handleMenuClose();
  };

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
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              mx: 'auto',
              mb: 3,
              bgcolor: 'primary.main',
              opacity: 0.1,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatBubbleOutline sx={{ fontSize: 48, color: 'primary.main', opacity: 1 }} />
          </Box>
          <Typography variant="h5" fontWeight="semibold" gutterBottom>
            Chào mừng đến với ChatApp
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Chọn một cuộc trò chuyện để bắt đầu nhắn tin
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton
              sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <PersonAdd />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Group />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Avatar>{selectedContact.name[0]}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedContact.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedContact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </Typography>
        </Box>
        <IconButton onClick={handleCallPhone}>
          <Phone />
        </IconButton>
        <IconButton onClick={handleCallVideo}>
          <VideoCall />
        </IconButton>
        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleViewProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xem hồ sơ</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSearch}>
            <ListItemIcon>
              <Search fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tìm kiếm</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleArchive}>
            <ListItemIcon>
              <Archive fontSize="small" />
            </ListItemIcon>
            <ListItemText>Lưu trữ</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Messages */}
      <MessageListMui 
        messages={messages}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
      />

      {/* Input */}
      <MessageInputMui 
        initialValue={editingContent}
        onSendMessage={handleSendOrEdit}
        editingMessageId={editingMessageId}
        onCancelEdit={handleCancelEdit}
        disabled={!isFriend || !isActive}
      />
    </Box>
  );
}
