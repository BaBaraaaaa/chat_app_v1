import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Clock, User, Trash2 } from 'lucide-react';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
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

export const FriendRequestManager: React.FC = () => {
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
    removeSocketListeners
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
          fetchFriends()
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
        fetchFriends()
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
    <div className="space-y-6">
      {/* Header với nút thêm bạn */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Quản lý bạn bè</h2>
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Real-time
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <div className="h-2 w-2 bg-orange-500 rounded-full" />
              Offline mode
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
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

      {/* Lời mời nhận được */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lời mời nhận được
            {friendRequests.length > 0 && (
              <Badge variant="secondary">{friendRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : friendRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Không có lời mời kết bạn nào
            </p>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <User className="h-6 w-6" />
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.fromUserId.displayName || request.fromUserId.username}</p>
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Lời mời đã gửi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lời mời đã gửi
            {sentRequests.length > 0 && (
              <Badge variant="secondary">{sentRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sentRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Chưa gửi lời mời nào
            </p>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <User className="h-6 w-6" />
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.toUserId.displayName}</p>
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Danh sách bạn bè */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Bạn bè
            {friends.length > 0 && (
              <Badge variant="secondary">{friends.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Chưa có bạn bè nào
            </p>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <User className="h-6 w-6" />
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{friend.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        Bạn bè
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFriend(friend._id, friend.displayName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendRequestManager;