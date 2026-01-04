import { useState, memo, useMemo, useCallback } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search,
  AddComment,
  PersonAdd,
  MoreVert,
  Archive,
  Group,
  ChatBubbleOutline,
  Delete,
} from "@mui/icons-material";
import type { Conversation } from "@/types/message";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { toast } from "sonner";
import { formatLastMessageTime } from "@/utils/helper";

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat?: () => void;
}

function ConversationListMui({
  onSelectConversation,
  onNewChat,
}: ConversationListProps) {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const {
    conversations,
    currentConversation,
    loading,
    searchResults,
    searchConversations,
    clearSearchResults,
  } = useConversationStore();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // Debounced search để tránh quá nhiều API calls
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      // Debounce search API call
      const timeoutId = setTimeout(() => {
        if (query.trim()) {
          searchConversations(query);
        } else {
          clearSearchResults();
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [searchConversations, clearSearchResults]
  );

  // ✅ Filter conversations với memoization
  const displayedConversations = useMemo(() => {
    const baseList = searchQuery ? searchResults : conversations || [];

    return baseList.filter((conv) => {
      // 1. Filter by Tab (0: Personal, 1: Group)
      const isGroup = conv.type === 'group';
      if (tabValue === 0 && isGroup) return false;
      if (tabValue === 1 && !isGroup) return false;

      // 2. Determine if it should be shown
      // Show if:
      // - Has lastMessage (active conversation)
      // - OR is currently selected (user clicked on it)
      // - OR is a Group (groups should show up even if empty initially, typically)
      // - OR matches search query (already filtered by baseList logic mostly, but good to keep in mind)

      const hasMessage = !!conv.lastMessage;
      const isSelected = currentConversation && conv._id === currentConversation._id;

      // Special logic: If it's a group, we might want to show it even without messages
      // For personal (direct), usually we show only if it has message OR is selected

      if (isGroup) {
        return true; // Show all groups for now
      }

      return hasMessage || isSelected;
    });
  }, [searchQuery, searchResults, conversations, currentConversation, tabValue]);

  // Memoize callback functions
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleArchive = useCallback(() => {
    toast.info("Tính năng tin nhắn đã lưu trữ đang được phát triển");
    handleMenuClose();
  }, [handleMenuClose]);

  const handleCreateGroup = useCallback(() => {
    toast.info("Tính năng tạo nhóm mới đang được phát triển");
    handleMenuClose();
  }, [handleMenuClose]);

  const getOtherParticipant = useCallback(
    (conversation: Conversation) => {
      return conversation.participants.find((p) => p._id !== user?._id);
    },
    [user?._id]
  );

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 320 },
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Trò chuyện
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {onNewChat && (
              <IconButton
                size="small"
                onClick={onNewChat}
                title="Tạo cuộc trò chuyện mới"
              >
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
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab
            icon={<ChatBubbleOutline sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Cá nhân"
          />
          <Tab
            icon={<Group sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Nhóm"
          />
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
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {loading && displayedConversations.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // p: { xs: 4, sm: 4 },
              p: 4,
            }}
          >
            {/* <CircularProgress size={ isSmallScreen ? 24 : 32 } /> */}
            <CircularProgress size={32} />
          </Box>
        ) : displayedConversations.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 4, sm: 8 },
              px: 2,
              color: "text.secondary"
            }}
          >
            <AddComment sx={{
              fontSize: { xs: 32, sm: 48 },
              opacity: 0.5,
              mb: { xs: 1, sm: 2 }
            }} />
            <Typography
              variant={isSmallScreen ? "body2" : "body1"}
            >
              {searchQuery
                ? "Không tìm thấy cuộc hội thoại"
                : "Chưa có cuộc hội thoại nào"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedConversations.map((conversation) => {
              const isGroup = conversation.type === 'group';
              const otherUser = isGroup ? null : getOtherParticipant(conversation);

              // For group, we don't need otherUser check, but for direct we do
              if (!isGroup && !otherUser) return null;

              const isActive = currentConversation?._id === conversation._id;
              const hasUnread = conversation.unreadCount > 0;

              // Display Info
              const displayName = isGroup ? conversation.name : (otherUser?.displayName || otherUser?.username);
              const avatarUrl = isGroup ? conversation.avatarUrl : otherUser?.avatarUrl;
              const isOnline = !isGroup && otherUser ? onlineUsers.includes(otherUser._id) : false;

              // Default avatar letter
              const avatarLetter = (displayName || "?").charAt(0).toUpperCase();

              return (
                <ListItemButton
                  key={conversation._id}
                  selected={isActive}
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                      "& .delete-btn": {
                        opacity: 1,
                      }
                    },
                  }}
                >
                  {/* Avatar with online status */}
                  <ListItemAvatar>
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={avatarUrl}
                        alt={displayName}
                        sx={{
                          width: { xs: 40, sm: 44 },
                          height: { xs: 40, sm: 44 }
                        }}
                      >
                        {isGroup ? <Group fontSize="small" /> : avatarLetter}
                      </Avatar>
                      {isOnline && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            width: { xs: 12, sm: 14 },
                            height: { xs: 12, sm: 14 },
                            borderRadius: "50%",
                            border: 2,
                            borderColor: "background.paper",
                            bgcolor: "success.main",
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
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={hasUnread ? 600 : 500}
                          color={hasUnread ? "primary.main" : "text.primary"}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {displayName}
                        </Typography>
                        {conversation.lastMessage && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1, flexShrink: 0, fontSize: "0.6875rem" }}
                          >
                            {formatLastMessageTime(
                              conversation.lastMessage.sentAt
                            )}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          color={hasUnread ? "text.primary" : "text.secondary"}
                          fontWeight={hasUnread ? 500 : 400}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            fontSize: "0.875rem",
                          }}
                        >
                          {conversation.lastMessage?.content ||
                            "Bắt đầu cuộc trò chuyện"}
                        </Typography>
                        {hasUnread && (
                          <Badge
                            badgeContent={
                              conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount
                            }
                            color="error"
                            sx={{
                              flexShrink: 0,
                              "& .MuiBadge-badge": {
                                fontSize: "0.625rem",
                                minWidth: 20,
                                height: 20,
                              },
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          className="delete-btn"
                          sx={{
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            ml: 1,
                            color: 'error.main'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Xóa cuộc hội thoại này?")) {
                              useConversationStore.getState().deleteConversation(conversation._id);
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
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

export default memo(ConversationListMui);
