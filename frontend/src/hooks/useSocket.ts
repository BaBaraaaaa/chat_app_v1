import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { useFriendStore } from '@/stores/useFriendStore';

/**
 * Custom hook để quản lý Socket.IO connection
 * Tự động kết nối khi user đăng nhập và ngắt kết nối khi đăng xuất
 */
export const useSocket = () => {
  const { user, accessToken } = useAuthStore();
  const { 
    isConnected, 
    isConnecting, 
    connectionError,
    connect, 
    disconnect, 
    registerUser,
    onlineUsers,
    onlineCount,
    notifications,
    unreadCount
  } = useSocketStore();
  
  const { setupSocketListeners, removeSocketListeners } = useFriendStore();
  const hasConnectedRef = useRef(false);
  const listenersSetupRef = useRef(false);

  // Auto connect/disconnect dựa trên auth state
  useEffect(() => {
    const shouldConnect = !!user && !!accessToken && !hasConnectedRef.current;
    const shouldDisconnect = (!user || !accessToken) && hasConnectedRef.current;

    if (shouldConnect) {
      console.log('🔌 Initiating socket connection for user:', user.username);
      
      connect(accessToken)
        .then((success) => {
          if (success) {
            hasConnectedRef.current = true;
            registerUser(user._id);
            
            // Setup friend-related socket listeners chỉ một lần
            if (!listenersSetupRef.current) {
              setupSocketListeners();
              listenersSetupRef.current = true;
            }
            
            console.log('✅ Socket connected and user registered:', user.username);
          }
        })
        .catch((error) => {
          console.error('❌ Socket connection failed:', error);
        });
    }

    if (shouldDisconnect) {
      console.log('🔌 Disconnecting socket for user logout');
      
      removeSocketListeners();
      disconnect();
      hasConnectedRef.current = false;
      listenersSetupRef.current = false; // Reset listeners flag
    }

    // Cleanup on unmount
    return () => {
      if (hasConnectedRef.current) {
        removeSocketListeners();
        disconnect();
        hasConnectedRef.current = false;
        listenersSetupRef.current = false; // Reset listeners flag
      }
    };
  }, [user, accessToken, connect, disconnect, registerUser, setupSocketListeners, removeSocketListeners]);

  // Reconnection logic khi connection bị mất
  useEffect(() => {
    if (!isConnected && user && accessToken && hasConnectedRef.current && !isConnecting) {
      console.log('🔄 Attempting to reconnect socket...');
      
      // Delay trước khi reconnect để tránh spam
      const reconnectTimer = setTimeout(() => {
        connect(accessToken)
          .then((success) => {
            if (success) {
              registerUser(user._id);
              // Không setup listeners lại vì đã setup rồi
              console.log('✅ Socket reconnected successfully');
            }
          })
          .catch((error) => {
            console.error('❌ Socket reconnection failed:', error);
          });
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, user, accessToken, isConnecting, connect, registerUser, setupSocketListeners]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Online users
    onlineUsers,
    onlineCount,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Manual connection control (nếu cần)
    connect: () => user && accessToken ? connect(accessToken) : Promise.resolve(false),
    disconnect,
    
    // Connection status helpers
    isUserOnline: (userId: string) => onlineUsers.includes(userId),
    getConnectionStatus: () => {
      if (isConnecting) return 'connecting';
      if (isConnected) return 'connected';
      if (connectionError) return 'error';
      return 'disconnected';
    }
  };
};

export default useSocket;