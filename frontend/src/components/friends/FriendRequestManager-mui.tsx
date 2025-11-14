import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material';
import {
  PersonAdd,
  Check,
  Close,
  AccessTime,
  Person,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { toast } from 'sonner';

export const FriendRequestManagerMui: React.FC = () => {
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const {
    receivedRequests: friendRequests,
    sentRequests,
    friends,
    loading: isLoading,
    sendFriendRequestByUsername: sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest: rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendRequests: fetchFriendRequests,
    getSentRequests: fetchSentRequests,
    getFriendsList: fetchFriends,
    setupSocketListeners,
    removeSocketListeners,
  } = useFriendStore();

  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch initial data chỉ 1 lần khi component mount
  useEffect(() => {
    const initializeData = async () => {
      if (user) {
        console.log('🔄 FriendRequestManager: Fetching initial data...');
        await Promise.all([
          fetchFriendRequests(),
          fetchSentRequests(),
          fetchFriends(),
        ]);
        console.log('✅ FriendRequestManager: Initial data loaded');
      }
    };

    initializeData();

    // Cleanup listeners khi component unmount
    return () => {
      removeSocketListeners();
    };
    // ⚠️ Chỉ chạy 1 lần khi mount - không bao gồm functions trong dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - chỉ fetch data 1 lần

  // Setup Socket listeners riêng biệt
  useEffect(() => {
    if (isConnected && user) {
      console.log('🔧 FriendRequestManager: Setting up socket listeners...');
      setupSocketListeners();
    }

    return () => {
      if (isConnected) {
        removeSocketListeners();
      }
    };
  }, [isConnected, user, setupSocketListeners, removeSocketListeners]);

  // Gửi lời mời kết bạn
  const handleSendRequest = async () => {
    if (!newFriendEmail.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    if (newFriendEmail === user?.email) {
      toast.error('Không thể gửi lời mời cho chính mình');
      return;
    }

    setSendingRequest(true);
    try {
      await sendFriendRequest(newFriendEmail);
      // ✅ Socket listener sẽ tự động show toast
      setNewFriendEmail('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Không thể gửi lời mời. Vui lòng thử lại.');
    } finally {
      setSendingRequest(false);
    }
  };

  // Chấp nhận lời mời
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      // ✅ Socket listener sẽ tự động show toast
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  // Từ chối lời mời
  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success('Đã từ chối lời mời kết bạn');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Không thể từ chối lời mời');
    }
  };

  // Hủy lời mời đã gửi
  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      // ✅ Socket listener sẽ tự động show toast
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Không thể hủy lời mời');
    }
  };

  // Xóa bạn bè
  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${friendName} khỏi danh sách bạn bè?`)) {
      try {
        await removeFriend(friendId);
        // ✅ Socket listener sẽ tự động show toast
      } catch (error) {
        console.error('Error removing friend:', error);
        toast.error('Không thể xóa bạn bè');
      }
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchFriendRequests(),
        fetchSentRequests(),
        fetchFriends(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return 'Vừa xong';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header với nút thêm bạn */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            Quản lý bạn bè
          </Typography>
          {isConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography variant="caption">Real-time</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'warning.main',
                  borderRadius: '50%',
                }}
              />
              <Typography variant="caption">Offline mode</Typography>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={handleRefresh}>
            Làm mới
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAdd />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Thêm bạn
          </Button>
        </Stack>
      </Box>

      <Stack spacing={3}>
        {/* Lời mời nhận được */}
        <Card>
          <CardHeader
            avatar={<AccessTime />}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Lời mời nhận được
                </Typography>
                {friendRequests.length > 0 && (
                  <Chip label={friendRequests.length} size="small" color="primary" />
                )}
              </Box>
            }
          />
          <Divider />
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : friendRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Không có lời mời kết bạn nào
              </Typography>
            ) : (
              <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {friendRequests.map((request) => (
                  <ListItem
                    key={request._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1.5,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {request.fromUserId.displayName || request.fromUserId.username}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {request.fromUserId.firstName} {request.fromUserId.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(request.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<Check />}
                        onClick={() => handleAcceptRequest(request._id)}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => handleRejectRequest(request._id)}
                      >
                        Từ chối
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Lời mời đã gửi */}
        <Card>
          <CardHeader
            avatar={<PersonAdd />}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Lời mời đã gửi
                </Typography>
                {sentRequests.length > 0 && (
                  <Chip label={sentRequests.length} size="small" color="primary" />
                )}
              </Box>
            }
          />
          <Divider />
          <CardContent>
            {sentRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Chưa gửi lời mời nào
              </Typography>
            ) : (
              <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {sentRequests.map((request) => (
                  <ListItem
                    key={request._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1.5,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {request.toUserId.displayName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {request.toUserId.firstName} {request.toUserId.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Gửi {formatTime(request.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={request.status === 'pending' ? 'Đang chờ' : request.status}
                        size="small"
                        variant="outlined"
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Hủy
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Danh sách bạn bè */}
        <Card>
          <CardHeader
            avatar={<Person />}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Bạn bè
                </Typography>
                {friends.length > 0 && (
                  <Chip label={friends.length} size="small" color="primary" />
                )}
              </Box>
            }
          />
          <Divider />
          <CardContent>
            {friends.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Chưa có bạn bè nào
              </Typography>
            ) : (
              <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {friends.map((friend) => (
                  <ListItem
                    key={friend._id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1.5,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {friend.displayName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {friend.email}
                        </Typography>
                      }
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="Bạn bè" size="small" color="success" variant="outlined" />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFriend(friend._id, friend.displayName)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Dialog thêm bạn */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Gửi lời mời kết bạn
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Email người dùng
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Nhập email..."
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setIsAddDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSendRequest}
            disabled={sendingRequest}
            startIcon={sendingRequest && <CircularProgress size={16} />}
          >
            Gửi lời mời
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FriendRequestManagerMui;
