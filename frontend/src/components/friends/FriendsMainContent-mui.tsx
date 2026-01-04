import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
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
  Groups,
} from '@mui/icons-material';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { toast } from 'sonner';
import type { FriendRequest } from '@/types/socket';
import type { Friend } from '@/types/store';

import GroupInvitationsPanelMui from './GroupInvitationsPanel-mui';

const FriendsMainContentMui = () => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const [activeSubView, setActiveSubView] = useState<'friends' | 'group_invitations'>('friends');

  const {
    receivedRequests,
    sentRequests,
    friends,
    loading: isLoading,
    sendFriendRequestByUsername,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendRequests,
    getSentRequests,
    getFriendsList,
  } = useFriendStore();

  const [newFriendUserName, setNewFriendUserName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [newFriendMessage, setNewFriendMessage] = useState('Xin chào! Mình muốn kết bạn với bạn.');

  // Tính số bạn bè đang online
  const onlineFriendsCount = useMemo(
    () => friends.filter((friend: Friend) => isUserOnline(friend._id)).length,
    [friends, onlineUsers]
  );

  // Gửi lời mời kết bạn
  const handleSendRequest = async () => {
    if (!newFriendUserName.trim()) {
      toast.error('Vui lòng nhập tên người dùng');
      return;
    }

    if (newFriendUserName === user?.username) {
      toast.error('Không thể gửi lời mời cho chính mình');
      return;
    }

    setSendingRequest(true);
    try {
      await sendFriendRequestByUsername(newFriendUserName, newFriendMessage);
      // Socket listener sẽ xử lý toast tự động
      setNewFriendUserName('');
      setNewFriendMessage('');
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
      // Socket listener sẽ xử lý toast tự động
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Không thể chấp nhận lời mời');
    }
  };

  // Từ chối lời mời
  const handleRejectRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      // Socket listener sẽ xử lý toast tự động
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Không thể từ chối lời mời');
    }
  };

  // Hủy lời mời đã gửi
  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      // Socket listener sẽ xử lý toast tự động
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
        // Socket listener sẽ xử lý toast tự động
      } catch (error) {
        console.error('Error removing friend:', error);
        toast.error('Không thể xóa bạn bè');
      }
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    try {
      await Promise.all([getFriendRequests(), getSentRequests(), getFriendsList()]);
      toast.success('Đã cập nhật lại danh sách bạn bè');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Không thể tải danh sách bạn bè');
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
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          p: 2,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Quản lý bạn bè
            </Typography>
            {onlineFriendsCount > 0 && activeSubView === 'friends' && (
              <Chip
                size="small"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                    <Typography variant="caption">{onlineFriendsCount} bạn online</Typography>
                  </Box>
                }
                variant="outlined"
                sx={{ borderColor: 'success.main', color: 'success.main' }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setActiveSubView('friends')}
              variant={activeSubView === 'friends' ? 'contained' : 'text'}
              size="small"
            >
              Bạn bè
            </Button>
            <Button
              onClick={() => setActiveSubView('group_invitations')}
              variant={activeSubView === 'group_invitations' ? 'contained' : 'text'}
              size="small"
            >
              Lời mời vào nhóm
            </Button>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button
              onClick={handleRefresh}
              variant="outlined"
              size="small"
              disabled={isLoading}
              startIcon={
                <Refresh
                  sx={{
                    animation: isLoading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              }
            >
              Làm mới
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="contained"
              size="small"
              startIcon={<PersonAdd />}
            >
              Thêm bạn
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeSubView === 'friends' ? (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Lời mời nhận được */}
              {receivedRequests.length > 0 && (
                <Card>
                  <CardHeader
                    avatar={<AccessTime />}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600}>
                          Lời mời nhận được
                        </Typography>
                        <Chip label={receivedRequests.length} size="small" color="primary" />
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {receivedRequests.map((request: FriendRequest) => (
                          <Box
                            key={request._id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 2,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}>
                                {request.fromUserId.displayName?.charAt(0).toUpperCase() ||
                                  request.fromUserId.username?.charAt(0).toUpperCase() || (
                                    <Person />
                                  )}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {request.fromUserId.displayName || request.fromUserId.username}
                                </Typography>
                                {request.message && (
                                  <Typography variant="body2" color="text.secondary">
                                    Lời nhắn:   {request.message}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(request.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
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
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lời mời đã gửi */}
              {sentRequests.length > 0 && (
                <Card>
                  <CardHeader
                    avatar={<PersonAdd />}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600}>
                          Lời mời đã gửi
                        </Typography>
                        <Chip label={sentRequests.length} size="small" color="secondary" />
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {sentRequests.map((request: FriendRequest) => (
                        <Box
                          key={request._id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}>
                              {request.toUserId.displayName?.charAt(0).toUpperCase() || <Person />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {request.toUserId.displayName}
                              </Typography>
                              {request.message && (
                                <Typography variant="body2" color="text.secondary">
                                  Lời nhắn:   {request.message}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Gửi {formatTime(request.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Danh sách bạn bè */}
              {friends.length > 0 && (
                <Card>
                  <CardHeader
                    avatar={<Person />}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600}>
                          Danh sách bạn bè
                        </Typography>
                        <Chip label={friends.length} size="small" color="secondary" />
                      </Box>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={1.5}>
                      {friends.map((friend: Friend) => (
                        <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={friend._id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 2,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Avatar src={friend.avatarUrl} sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                                {!friend.avatarUrl && <Person />}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {friend.displayName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {friend.email}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFriend(friend._id, friend.displayName)}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'error.contrastText',
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {receivedRequests.length === 0 && sentRequests.length === 0 && friends.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 16,
                    textAlign: 'center',
                  }}
                >
                  <Groups sx={{ fontSize: 96, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Chưa có bạn bè nào
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
                    Bắt đầu kết nối với mọi người bằng cách gửi lời mời kết bạn. Nhấn nút "Thêm bạn"
                    để bắt đầu!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    Thêm bạn bè đầu tiên
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <GroupInvitationsPanelMui />
        )}
      </Box>

      {/* Dialog thêm bạn */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography component="div" variant='h6' fontWeight={600}>
            Gửi lời mời kết bạn
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Nhập username mà bạn muốn kết bạn
            </Typography>
            <TextField
              fullWidth
              type="text"
              placeholder="Nhập tên người dùng..."
              value={newFriendUserName}
              onChange={(e) => setNewFriendUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
              autoFocus
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Nhập lời nhắn kèm (tùy chọn)
            </Typography>
            <TextField
              fullWidth
              type="text"
              placeholder="Nhập lời nhắn..."
              value={newFriendMessage}
              onChange={(e) => setNewFriendMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
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

export default FriendsMainContentMui;
