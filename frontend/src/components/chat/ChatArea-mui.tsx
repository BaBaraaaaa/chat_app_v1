import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Phone,
  VideoCall,
  MoreVert,
  Person,
  Search,
  Archive,
  ChatBubbleOutline,
  PersonAdd,
  Group,
  ArrowBack
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
  onMobileBack?: () => void;
  isMobile?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}
import { GroupSettingsDialogMui } from './GroupSettingsDialog-mui';


export default function ChatAreaMui({
  selectedContact,
  messages,
  onSendMessage,
  isFriend = true,
  isActive = true,
  onMobileBack,
  isMobile = false,
  onLoadMore,
  hasMore = false,
  loading = false
}: ChatAreaProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false); // State for settings dialog

  const { editMessage, deleteMessage } = useMessageStore();
  const open = Boolean(anchorEl);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenGroupSettings = () => {
    setGroupSettingsOpen(true);
    handleMenuClose();
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
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: { xs: '280px', sm: '400px' } }}>
          <Box
            sx={{
              width: { xs: 64, sm: 96 },
              height: { xs: 64, sm: 96 },
              mx: 'auto',
              mb: { xs: 2, sm: 3 },
              bgcolor: 'primary.main',
              opacity: 0.1,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatBubbleOutline sx={{
              fontSize: { xs: 32, sm: 48 },
              color: 'primary.main',
              opacity: 1
            }} />
          </Box>
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            fontWeight="semibold"
            gutterBottom
          >
            Chào mừng đến với ChatApp
          </Typography>
          <Typography
            component="p"
            color="text.secondary"
            sx={{ mb: { xs: 2, sm: 3 } }}
            variant={isSmallScreen ? "body2" : "body1"}
          >
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
          p: { xs: 1, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Mobile Back Button */}
        {isMobile && onMobileBack && (
          <IconButton
            onClick={onMobileBack}
            sx={{
              mr: 1,
              color: 'text.primary'
            }}
          >
            <ArrowBack />
          </IconButton>
        )}

        <Avatar
          src={selectedContact.avatarUrl}
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 }
          }}
        >
          {selectedContact.name[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {selectedContact.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
          >
            {selectedContact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </Typography>
        </Box>

        {/* Action Buttons - Hide some on mobile */}
        {!isSmallScreen && (
          <>
            <IconButton onClick={handleCallPhone} size={isSmallScreen ? 'small' : 'medium'}>
              <Phone />
            </IconButton>
            <IconButton onClick={handleCallVideo} size={isSmallScreen ? 'small' : 'medium'}>
              <VideoCall />
            </IconButton>
          </>
        )}
        <IconButton onClick={handleMenuOpen} size={isSmallScreen ? 'small' : 'medium'}>
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
          {selectedContact?.type === 'group' && (
            <MenuItem onClick={handleOpenGroupSettings}>
              <ListItemIcon>
                <Group fontSize="small" />
              </ListItemIcon>
              <ListItemText>Thông tin nhóm</ListItemText>
            </MenuItem>
          )}
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
        key={selectedContact?.id}
        messages={messages}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loading={loading}
      />

      {/* Input */}
      <MessageInputMui
        initialValue={editingContent}
        onSendMessage={handleSendOrEdit}
        editingMessageId={editingMessageId}
        onCancelEdit={handleCancelEdit}
        disabled={!isFriend || !isActive}
      />

      {/* Group Settings Dialog */}
      <GroupSettingsDialogMui
        open={groupSettingsOpen}
        onOpenChange={setGroupSettingsOpen}
      />
    </Box>
  );
}
