import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { useFriendStore } from '@/stores/useFriendStore';
import { useConversationStore } from '@/stores/useConversationStore';
import { useMessageStore } from '@/stores/useMessageStore';
import { useGroupInvitationStore } from '@/stores/useGroupInvitationStore';

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
  } = useSocketStore();

  const { setupSocketListeners, removeSocketListeners } = useFriendStore();
  const { setupSocketListeners: setupConversationListeners, removeSocketListeners: removeConversationListeners } = useConversationStore();
  const { setupSocketListeners: setupMessageListeners, removeSocketListeners: removeMessageListeners } = useMessageStore();
  const { setupSocketListeners: setupInvitationListeners, removeSocketListeners: removeInvitationListeners } = useGroupInvitationStore();

  const hasConnectedRef = useRef(false);
  const listenersSetupRef = useRef(false);

  // Auto connect/disconnect dựa trên auth state
  useEffect(() => {
    const userId = user?._id;
    const shouldConnect = !!userId && !!accessToken && !hasConnectedRef.current;
    const shouldDisconnect = (!userId || !accessToken) && hasConnectedRef.current;

    if (shouldConnect) {

      connect(accessToken)
        .then((success) => {
          if (success) {
            hasConnectedRef.current = true;

            // ✅ registerUser có flag check trong store rồi
            registerUser(userId);

            // ✅ Setup TẤT CẢ socket listeners chỉ một lần
            if (!listenersSetupRef.current) {
              setupSocketListeners();         // Friend listeners
              setupConversationListeners();   // Conversation listeners
              setupMessageListeners();        // Message listeners
              setupInvitationListeners();     // Group Invitation listeners
              listenersSetupRef.current = true;
            }

          }
        })
        .catch((error) => {
          console.error('❌ Socket connection failed:', error);
        });
    }

    if (shouldDisconnect) {

      // ✅ Remove TẤT CẢ listeners
      removeSocketListeners();
      removeConversationListeners();
      removeMessageListeners();
      removeInvitationListeners();
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
        removeInvitationListeners();
        disconnect();
        hasConnectedRef.current = false;
        listenersSetupRef.current = false;
      }
    };
  }, [
    user?._id,
    accessToken,
    connect,
    disconnect,
    registerUser,
    setupSocketListeners,
    removeSocketListeners,
    setupConversationListeners,
    removeConversationListeners,
    setupMessageListeners,
    removeMessageListeners,
    setupInvitationListeners,
    removeInvitationListeners
  ]);

  // Reconnection logic khi connection bị mất
  useEffect(() => {
    // ⚠️ CHỈ reconnect khi đã từng connected và BỊ MẤT kết nối (không phải lần đầu)
    const shouldReconnect = !isConnected &&
      user &&
      accessToken &&
      hasConnectedRef.current &&
      !isConnecting;

    if (shouldReconnect) {

      // Delay trước khi reconnect để tránh spam
      const reconnectTimer = setTimeout(() => {
        connect(accessToken)
          .then((success) => {
            if (success) {
              // ✅ Re-register sau khi reconnect (store có flag check rồi)
              registerUser(user._id);
            }
          })
          .catch((error) => {
            console.error('❌ Socket reconnection failed:', error);
          });
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, user, accessToken, isConnecting, connect, registerUser]);

  // Manual connection control
  const manualConnect = useCallback(() =>
    user && accessToken ? connect(accessToken) : Promise.resolve(false),
    [user, accessToken, connect]);

  // Connection status helpers
  const isUserOnline = useCallback((userId: string) =>
    onlineUsers.includes(userId),
    [onlineUsers]);

  const getConnectionStatus = useCallback(() => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    if (connectionError) return 'error';
    return 'disconnected';
  }, [isConnecting, isConnected, connectionError]);

  return useMemo(() => ({
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Online users
    onlineUsers,
    onlineCount,

    // Manual connection control
    connect: manualConnect,
    disconnect,

    // Connection status helpers
    isUserOnline,
    getConnectionStatus
  }), [
    isConnected,
    isConnecting,
    connectionError,
    onlineUsers,
    onlineCount,
    manualConnect,
    disconnect,
    isUserOnline,
    getConnectionStatus
  ]);
};

export default useSocket;