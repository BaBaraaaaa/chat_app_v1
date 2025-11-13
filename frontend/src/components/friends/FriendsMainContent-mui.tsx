import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Button, Stack, Chip } from '@mui/material';
import { Check, Close, PersonRemove } from '@mui/icons-material';
import type { FriendRequest } from '@/types/socket';
import type { Friend } from '@/type/store';

interface FriendsMainContentProps {
  activeTab: 'all' | 'received' | 'sent';
  friends: Friend[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onCancel: (requestId: string) => void;
  onRemove: (friendId: string) => void;
}

export default function FriendsMainContentMui({
  activeTab,
  friends,
  receivedRequests,
  sentRequests,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
}: FriendsMainContentProps) {
  const renderContent = () => {
    if (activeTab === 'all') {
      if (friends.length === 0) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Chưa có bạn bè
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy thêm bạn mới để bắt đầu trò chuyện
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Danh sách bạn bè ({friends.length})
          </Typography>
          <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {friends.map((friend) => (
              <ListItem
                key={friend._id}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s',
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    color="error" 
                    onClick={() => onRemove(friend._id)}
                    sx={{
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <PersonRemove />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar 
                    src={friend.avatarUrl} 
                    alt={friend.displayName}
                    sx={{ width: 48, height: 48 }}
                  >
                    {friend.displayName[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={600}>
                      {friend.displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      @{friend.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }

    if (activeTab === 'received') {
      if (receivedRequests.length === 0) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Không có lời mời nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa nhận được lời mời kết bạn nào
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Lời mời kết bạn ({receivedRequests.length})
          </Typography>
          <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {receivedRequests.map((request) => (
              <ListItem
                key={request._id}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: 2,
                  borderColor: 'success.light',
                  p: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={request.fromUserId.avatar} 
                    alt={request.fromUserId.displayName}
                    sx={{ width: 56, height: 56 }}
                  >
                    {request.fromUserId.displayName?.[0] || request.fromUserId.username[0]}
                  </Avatar>
                </ListItemAvatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {request.fromUserId.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    @{request.fromUserId.username}
                  </Typography>
                  {request.message && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        p: 1.5, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1,
                        fontStyle: 'italic',
                      }}
                    >
                      "{request.message}"
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      size="medium"
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      onClick={() => onAccept(request._id)}
                      sx={{ flex: 1 }}
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      size="medium"
                      variant="outlined"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => onDecline(request._id)}
                      sx={{ flex: 1 }}
                    >
                      Từ chối
                    </Button>
                  </Stack>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }

    if (activeTab === 'sent') {
      if (sentRequests.length === 0) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Chưa gửi lời mời nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy thêm bạn mới để bắt đầu kết nối
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Lời mời đã gửi ({sentRequests.length})
          </Typography>
          <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {sentRequests.map((request) => (
              <ListItem
                key={request._id}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'warning.light',
                  p: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={request.toUserId.avatar} 
                    alt={request.toUserId.displayName}
                    sx={{ width: 48, height: 48 }}
                  >
                    {request.toUserId.displayName?.[0] || request.toUserId.username[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={600}>
                      {request.toUserId.displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      @{request.toUserId.username}
                    </Typography>
                  }
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label="Đang chờ" 
                    size="small" 
                    color="warning"
                    icon={<Send />}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onCancel(request._id)}
                  >
                    Hủy
                  </Button>
                </Stack>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {renderContent()}
    </Box>
  );
}
