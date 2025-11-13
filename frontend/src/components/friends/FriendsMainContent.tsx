import { useState, useMemo } from 'react';
import { UserPlus, Check, X, Clock, User, Trash2, RefreshCw, Users } from 'lucide-react';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import SocketStatus from '@/components/socket/SocketStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const FriendsMainContent = () => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const isUserOnline = (userId: string) => onlineUsers.includes(userId);
  
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

  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Tính số bạn bè đang online
  const onlineFriendsCount = useMemo(
    () => friends.filter(friend => isUserOnline(friend._id)).length,
    [friends, isUserOnline]
  );

  // Debug log
  console.log('🔍 FriendsMainContent Debug:', {
    totalFriends: friends.length,
    onlineFriendsCount,
    friendIds: friends.map(f => f._id),
    isUserOnlineCheck: friends.map(f => ({ id: f._id, online: isUserOnline(f._id) }))
  });

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
      await sendFriendRequestByUsername(newFriendEmail);
      // Socket listener sẽ xử lý toast tự động
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
      await Promise.all([
        getFriendRequests(),
        getSentRequests(),
        getFriendsList()
      ]);
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
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Quản lý bạn bè</h1>
            <SocketStatus showNotifications={true} showOnlineCount={false} />
            {onlineFriendsCount > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1.5" />
                {onlineFriendsCount} bạn online
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm bạn
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gửi lời mời kết bạn</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email người dùng</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email..."
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSendRequest}
                      disabled={sendingRequest}
                    >
                      {sendingRequest && <LoadingSpinner className="mr-2 h-4 w-4" />}
                      Gửi lời mời
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Lời mời nhận được */}
          {receivedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lời mời nhận được
                  <Badge variant="default">{receivedRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                              {request.fromUserId.displayName?.charAt(0).toUpperCase() || 
                               request.fromUserId.username?.charAt(0).toUpperCase() || 
                               <User className="h-6 w-6" />}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium text-lg">
                              {request.fromUserId.displayName || request.fromUserId.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.fromUserId.firstName} {request.fromUserId.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request._id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request._id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lời mời đã gửi */}
          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Lời mời đã gửi
                  <Badge variant="secondary">{sentRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                            {request.toUserId.displayName?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium text-lg">{request.toUserId.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.toUserId.firstName} {request.toUserId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gửi {formatTime(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {request.status === 'pending' ? 'Đang chờ' : request.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(request._id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danh sách bạn bè */}
          {friends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Danh sách bạn bè
                  <Badge variant="secondary">{friends.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10">
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {friend.displayName?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                          </div>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{friend.displayName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {friend.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFriend(friend._id, friend.displayName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {receivedRequests.length === 0 && sentRequests.length === 0 && friends.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-24 w-24 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có bạn bè nào</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Bắt đầu kết nối với mọi người bằng cách gửi lời mời kết bạn.
                Nhấn nút "Thêm bạn" để bắt đầu!
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm bạn bè đầu tiên
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FriendsMainContent;
