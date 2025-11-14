import { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Badge,
  CircularProgress,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  AddComment,
  PersonAdd, 
  MoreVert,
  Archive,
  Group,
  ChatBubbleOutline,
} from '@mui/icons-material';
import type { Conversation } from '@/types/message';
import { useConversationStore } from '@/stores/useConversationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { toast } from 'sonner';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat?: () => void;
}

export default function ConversationListMui({
  onSelectConversation,
  onNewChat,
}: ConversationListProps) {
  const { user } = useAuthStore();
  const { isConnected, onlineUsers } = useSocketStore();
  const {
    conversations,
    currentConversation,
    loading,
    searchResults,
    getConversations,
    searchConversations,
    clearSearchResults,
    setupSocketListeners,
    removeSocketListeners,
  } = useConversationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Setup listeners when connected
  useEffect(() => {
    if (isConnected && user) {
      console.log('🔗 Setting up conversation Socket listeners...');
      setupSocketListeners();
      getConversations();
    }

    return () => {
      if (isConnected) {
        removeSocketListeners();
      }
    };
  }, [isConnected, user, setupSocketListeners, getConversations, removeSocketListeners]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      clearSearchResults();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleArchive = () => {
    toast.info('Tính năng tin nhắn đã lưu trữ đang được phát triển');
    handleMenuClose();
  };

  const handleCreateGroup = () => {
    toast.info('Tính năng tạo nhóm mới đang được phát triển');
    handleMenuClose();
  };

  // ✅ Filter conversations để chỉ hiển thị:
  // 1. Conversations có lastMessage (đã có tin nhắn)
  // 2. HOẶC là currentConversation (đang mở để gửi tin nhắn)
  const displayedConversations = (() => {
    const baseList = searchQuery ? searchResults : conversations;
    
    return baseList.filter(conv => 
      conv.lastMessage || // Có tin nhắn
      (currentConversation && conv._id === currentConversation._id) // Hoặc đang được chọn
    );
  })();

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString('vi-VN');
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== user?._id);
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Trò chuyện
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onNewChat && (
              <IconButton size="small" onClick={onNewChat} title="Tạo cuộc trò chuyện mới">
                <PersonAdd fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={handleMenuOpen} title="Tùy chọn">
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm cuộc hội thoại..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: '0.875rem',
            },
          }}
        >
          <Tab
            icon={<ChatBubbleOutline sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Cá nhân"
          />
          <Tab icon={<Group sx={{ fontSize: 18 }} />} iconPosition="start" label="Nhóm" />
        </Tabs>
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleArchive}>
          <ListItemIcon>
            <Archive fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Tin nhắn đã lưu trữ</Typography>
        </MenuItem>
        <MenuItem onClick={handleCreateGroup}>
          <ListItemIcon>
            <Group fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Tạo nhóm mới</Typography>
        </MenuItem>
      </Menu>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading && displayedConversations.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : displayedConversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2, color: 'text.secondary' }}>
            <AddComment sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography variant="body2">
              {searchQuery ? 'Không tìm thấy cuộc hội thoại' : 'Chưa có cuộc hội thoại nào'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isActive = currentConversation?._id === conversation._id;
              const hasUnread = conversation.unreadCount > 0;
              const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

              if (!otherUser) return null;

              return (
                <ListItemButton
                  key={conversation._id}
                  selected={isActive}
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {/* Avatar with online status */}
                  <ListItemAvatar>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={otherUser.avatar}
                        alt={otherUser.displayName}
                        sx={{ width: 44, height: 44 }}
                      >
                        {(otherUser.displayName || otherUser.username).charAt(0).toUpperCase()}
                      </Avatar>
                      {isOnline && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: 2,
                            borderColor: 'background.paper',
                            bgcolor: 'success.main',
                          }}
                        />
                      )}
                    </Box>
                  </ListItemAvatar>

                  {/* Content */}
                  <ListItemText
                    sx={{ ml: 1 }}
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={hasUnread ? 600 : 500}
                          color={hasUnread ? 'primary.main' : 'text.primary'}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {otherUser.displayName || otherUser.username}
                        </Typography>
                        {conversation.lastMessage && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1, flexShrink: 0, fontSize: '0.6875rem' }}
                          >
                            {formatLastMessageTime(conversation.lastMessage.sentAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color={hasUnread ? 'text.primary' : 'text.secondary'}
                          fontWeight={hasUnread ? 500 : 400}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            fontSize: '0.875rem',
                          }}
                        >
                          {conversation.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                        </Typography>
                        {hasUnread && (
                          <Badge
                            badgeContent={
                              conversation.unreadCount > 99 ? '99+' : conversation.unreadCount
                            }
                            color="error"
                            sx={{
                              flexShrink: 0,
                              '& .MuiBadge-badge': {
                                fontSize: '0.625rem',
                                minWidth: 20,
                                height: 20,
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
