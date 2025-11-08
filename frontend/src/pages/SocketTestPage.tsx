import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SocketStatus from '@/components/socket/SocketStatus';
import FriendRequestManager from '@/components/friends/FriendRequestManager';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';

export const SocketTestPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setupSocketListeners, removeSocketListeners } = useFriendStore();

  useEffect(() => {
    // Thiết lập Socket listeners khi component mount
    if (user) {
      setupSocketListeners();
    }

    // Cleanup khi component unmount
    return () => {
      removeSocketListeners();
    };
  }, [user, setupSocketListeners, removeSocketListeners]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vui lòng đăng nhập để sử dụng tính năng này
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header với Socket Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Socket.IO Demo</span>
            <SocketStatus showNotifications={true} showOnlineCount={true} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Thông tin người dùng</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Tên:</span> {user.displayName}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Username:</span> {user.username}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Tính năng Socket.IO</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ Kết nối real-time với server</li>
                <li>✅ Thông báo friend request thời gian thực</li>
                <li>✅ Cập nhật trạng thái online/offline</li>
                <li>✅ Xử lý kết nối tự động khi đăng nhập/đăng xuất</li>
                <li>✅ Fallback REST API khi Socket không khả dụng</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friend Request Manager */}
      <FriendRequestManager />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Kết nối Socket.IO:</h4>
              <p className="text-muted-foreground">
                Socket sẽ tự động kết nối khi bạn đăng nhập và ngắt kết nối khi đăng xuất.
                Trạng thái kết nối được hiển thị ở góc trên bên phải.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Thông báo real-time:</h4>
              <p className="text-muted-foreground">
                Khi có friend request mới, bạn sẽ nhận được thông báo ngay lập tức
                mà không cần reload trang.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Gửi friend request:</h4>
              <p className="text-muted-foreground">
                Nhấn nút "Thêm bạn" và nhập email của người bạn muốn kết bạn.
                Nếu Socket đang kết nối, request sẽ được gửi real-time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Environment setup:</h4>
              <p className="text-muted-foreground">
                Đảm bảo biến VITE_SERVER_URL trong file .env trỏ đến backend Socket.IO server của bạn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocketTestPage;