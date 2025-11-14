import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  Box,
  InputAdornment,
  CircularProgress,
  Typography,
  Avatar,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Button,
  DialogActions,
} from '@mui/material';
import { Search, ChatBubbleOutline } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useFriendStore } from '@/stores/useFriendStore';
import { useConversationStore } from '@/stores/useConversationStore';
import type { User } from '@/type/user';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function NewChatDialogMui({
  open,
  onOpenChange,
  onConversationCreated,
}: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const { friends, loading: loadingFriends, getFriendsList } = useFriendStore();
  const { getOrCreateConversation } = useConversationStore();

  // Load friends khi mở dialog
  useEffect(() => {
    if (open) {
      getFriendsList();
      setSearchQuery('');
    }
  }, [open, getFriendsList]);

  // Filter friends by search query
  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query) ||
      friend.email?.toLowerCase().includes(query)
    );
  });

  const handleCreateChat = async (friend: User) => {
    try {
      setCreating(true);

      // Call store action để get/create conversation
      getOrCreateConversation(friend._id);

      // Wait a bit for socket response
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Close dialog
      onOpenChange(false);

      // Callback if provided
      if (onConversationCreated) {
        // We don't have conversationId immediately, but store will handle it
        onConversationCreated(friend._id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Bắt đầu cuộc trò chuyện mới
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Chọn bạn bè để bắt đầu trò chuyện 
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Friends List */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {loadingFriends ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredFriends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <ChatBubbleOutline sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Kết bạn để bắt đầu trò chuyện'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredFriends.map((friend) => (
                <ListItemButton
                  key={friend._id}
                  onClick={() => handleCreateChat(friend)}
                  disabled={creating}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={friend.avatarUrl}
                      alt={friend.displayName || friend.username}
                      sx={{ width: 40, height: 40 }}
                    >
                      {(friend.displayName || friend.username).charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={500}>
                        {friend.displayName || friend.username}
                      </Typography>
                    }
                    secondary={
                      friend.email && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {friend.email}
                        </Typography>
                      )
                    }
                  />

                  <ChatBubbleOutline sx={{ color: 'text.secondary', fontSize: 20 }} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onOpenChange(false)} variant="outlined">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
