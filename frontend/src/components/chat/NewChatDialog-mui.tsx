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
import type { User } from '@/types/user';
import type { Friend } from '@/types/store';

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
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);

  const { friends, loading: loadingFriends, getFriendsList } = useFriendStore();
  const { getOrCreateConversation } = useConversationStore();

  useEffect(() => {
    if (open) {
      getFriendsList();
      setSearchQuery('');
      setGroupName('');
      setSelectedFriends([]);
    }
  }, [open, getFriendsList]);

  const filteredFriends = friends.filter((friend: Friend) => {
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query) ||
      friend.email?.toLowerCase().includes(query)
    );
  });

  const handleToggleFriend = (friend: Friend) => {
    setSelectedFriends(prev => {
      const exists = prev.some(f => f._id === friend._id);
      if (exists) {
        return prev.filter(f => f._id !== friend._id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedFriends.length === 0) return;

    try {
      setCreating(true);

      if (selectedFriends.length === 1) {
        // 1-1 Chat: Use existing flow
        await getOrCreateConversation(selectedFriends[0]._id);

        if (onConversationCreated) {
          // Basic delay to ensure socket join room processing (optional but safer)
          await new Promise((resolve) => setTimeout(resolve, 500));
          onConversationCreated(selectedFriends[0]._id);
        }

      } else {
        // Group Chat
        if (!groupName.trim()) {
          // Should show error validaton here, but for now just return
          setCreating(false);
          return;
        }

        const participantIds = selectedFriends.map(f => f._id);
        // Use store action
        const { createGroup } = useConversationStore.getState();
        const newConversationId = await createGroup(groupName, participantIds);

        if (newConversationId) {
          if (onConversationCreated) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            onConversationCreated(newConversationId);
          }
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const isGroupMode = selectedFriends.length > 1;

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle component="div">
        <Typography component="h6" fontWeight={600}>
          {isGroupMode ? "Tạo nhóm mới" : "Bắt đầu cuộc trò chuyện mới"}
        </Typography>
        <Typography component="h6" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isGroupMode
            ? `${selectedFriends.length} thành viên đã chọn`
            : "Chọn bạn bè để bắt đầu"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isGroupMode && (
          <TextField
            fullWidth
            size="small"
            label="Tên nhóm"
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
        )}

        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, mt: isGroupMode ? 0 : 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {loadingFriends ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredFriends.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography variant="body1">
                {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredFriends.map((friend: Friend) => {
                const isSelected = selectedFriends.some(f => f._id === friend._id);
                return (
                  <ListItemButton
                    key={friend._id}
                    onClick={() => handleToggleFriend(friend)}
                    selected={isSelected}
                    disabled={creating}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
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
                      primary={friend.displayName || friend.username}
                      secondary={friend.email}
                    />

                    {/* Checkbox style indication for selection */}
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'primary.main' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isSelected && <Typography variant="caption" color="white">✓</Typography>}
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => onOpenChange(false)} variant="outlined">
          Hủy
        </Button>
        <Button
          onClick={handleCreateChat}
          variant="contained"
          disabled={creating || selectedFriends.length === 0 || (isGroupMode && !groupName.trim())}
        >
          {creating ? "Đang tạo..." : isGroupMode ? "Tạo nhóm" : "Nhắn tin"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
