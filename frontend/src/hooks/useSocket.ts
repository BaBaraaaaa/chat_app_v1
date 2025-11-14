import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { useFriendStore } from '@/stores/useFriendStore';
import { useConversationStore } from '@/stores/useConversationStore';
import { useMessageStore } from '@/stores/useMessageStore';

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
  const { setupSocketListeners: setupConversationListeners, removeSocketListeners: removeConversationListeners } = useConversationStore();
  const { setupSocketListeners: setupMessageListeners, removeSocketListeners: removeMessageListeners } = useMessageStore();
  
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
            
            // ✅ registerUser có flag check trong store rồi
            registerUser(user._id);
            
            // ✅ Setup TẤT CẢ socket listeners chỉ một lần
            if (!listenersSetupRef.current) {
              console.log('🎧 Đang thiết lập TẤT CẢ các socket listeners (Friend, Conversation, Message)');
              setupSocketListeners();         // Friend listeners
              setupConversationListeners();   // Conversation listeners
              setupMessageListeners();        // Message listeners
              listenersSetupRef.current = true;
            }
            
            console.log('✅ Socket đã kết nối và đăng ký người dùng:', user.username);
          }
        })
        .catch((error) => {
          console.error('❌ Socket connection failed:', error);
        });
    }

    if (shouldDisconnect) {
      console.log('🔌 Disconnecting socket for user logout');
      
      // ✅ Remove TẤT CẢ listeners
      removeSocketListeners();
      removeConversationListeners();
      removeMessageListeners();
      disconnect();
      hasConnectedRef.current = false;
      listenersSetupRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (hasConnectedRef.current) {
        removeSocketListeners();
        removeConversationListeners();
        removeMessageListeners();
        disconnect();
        hasConnectedRef.current = false;
        listenersSetupRef.current = false;
      }
    };
  }, [user, accessToken, connect, disconnect, registerUser, setupSocketListeners, removeSocketListeners, setupConversationListeners, removeConversationListeners, setupMessageListeners, removeMessageListeners]);

  // Reconnection logic khi connection bị mất
  useEffect(() => {
    // ⚠️ CHỈ reconnect khi đã từng connected và BỊ MẤT kết nối (không phải lần đầu)
    const shouldReconnect = !isConnected && 
                           user && 
                           accessToken && 
                           hasConnectedRef.current && 
                           !isConnecting;
    
    if (shouldReconnect) {
      console.log('🔄 Attempting to reconnect socket...');
      
      // Delay trước khi reconnect để tránh spam
      const reconnectTimer = setTimeout(() => {
        connect(accessToken)
          .then((success) => {
            if (success) {
              // ✅ Re-register sau khi reconnect (store có flag check rồi)
              registerUser(user._id);
              console.log('✅ Socket reconnected and user re-registered');
            }
          })
          .catch((error) => {
            console.error('❌ Socket reconnection failed:', error);
          });
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, user, accessToken, isConnecting, connect, registerUser]);

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