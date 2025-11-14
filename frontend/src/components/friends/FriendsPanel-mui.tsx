import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import FriendsMainContentMui from './FriendsMainContent-mui';

export default function FriendsPanelMui() {
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const {
    setupSocketListeners,
    removeSocketListeners,
    getFriendRequests,
    getSentRequests,
    getFriendsList,
  } = useFriendStore();

  useEffect(() => {
    // Fetch initial data chỉ 1 lần khi component mount
    const initializeData = async () => {
      if (user) {
        console.log('🔄 Fetching initial friends data...');
        await Promise.all([getFriendRequests(), getSentRequests(), getFriendsList()]);
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Vui lòng đăng nhập để sử dụng tính năng bạn bè
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Main Content - FriendsMainContentMui already has everything */}
      <FriendsMainContentMui />
    </Box>
  );
}
