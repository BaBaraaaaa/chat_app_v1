import { useEffect } from 'react';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import FriendsSidebar from './FriendsSidebar';
import FriendsMainContent from './FriendsMainContent';

const FriendsPanel = () => {
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const { setupSocketListeners, removeSocketListeners, getFriendRequests, getSentRequests, getFriendsList } = useFriendStore();

  useEffect(() => {
    // Fetch initial data khi component mount
    const initializeData = async () => {
      if (user) {
        await Promise.all([
          getFriendRequests(),
          getSentRequests(),
          getFriendsList()
        ]);
      }
    };

    initializeData();

    // Setup Socket listeners nếu đã kết nối
    if (user && isConnected) {
      setupSocketListeners();
    }

    // Cleanup khi component unmount
    return () => {
      removeSocketListeners();
    };
  }, [user, isConnected, setupSocketListeners, removeSocketListeners, getFriendRequests, getSentRequests, getFriendsList]);

  // Re-setup listeners khi Socket connection thay đổi
  useEffect(() => {
    if (isConnected && user) {
      setupSocketListeners();
    }
  }, [isConnected, user, setupSocketListeners]);

  if (!user) {
    return (
      <div className="flex items-center justify-center flex-1 bg-background">
        <p className="text-muted-foreground">
          Vui lòng đăng nhập để sử dụng tính năng bạn bè
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-background overflow-hidden">
      {/* Friends Sidebar - danh sách bạn bè */}
      <FriendsSidebar />
      
      {/* Main Content - lời mời kết bạn và quản lý */}
      <FriendsMainContent />
    </div>
  );
};

export default FriendsPanel;
