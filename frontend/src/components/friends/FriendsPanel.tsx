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
    // Fetch initial data chỉ 1 lần khi component mount
    const initializeData = async () => {
      if (user) {
        console.log('🔄 Fetching initial friends data...');
        await Promise.all([
          getFriendRequests(),
          getSentRequests(),
          getFriendsList()
        ]);
        console.log('✅ Initial friends data loaded');
      }
    };

    initializeData();

    // Cleanup khi component unmount
    return () => {
      removeSocketListeners();
    };
    // Chỉ chạy khi component mount, không phụ thuộc vào isConnected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⚠️ Empty dependency array - chỉ chạy 1 lần

  // Setup Socket listeners riêng biệt
  useEffect(() => {
    if (isConnected && user) {
      console.log('🔧 Setting up friend socket listeners...');
      setupSocketListeners();
    }

    return () => {
      if (isConnected) {
        removeSocketListeners();
      }
    };
  }, [isConnected, user, setupSocketListeners, removeSocketListeners]);

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
