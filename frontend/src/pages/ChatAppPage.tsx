import { useState, useEffect } from "react";
import LayoutMui from "@/components/layout/Layout-mui";
import ChatPanel from "@/components/chat/ChatPanel";
import FriendsPanelMui from "@/components/friends/FriendsPanel-mui";
import NotificationsPanelMui from "@/components/notifications/NotificationsPanel-mui";
import SettingsPanelMui from "@/components/settings/SettingsPanel-mui";
import { useSocket } from "@/hooks/useSocket";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
// import { SocketDebugPanel } from "@/components/debug/SocketDebugPanel";

const ChatAppPage = () => {
  const [activeView, setActiveView] = useState<'chat' | 'friends' | 'settings' | 'notifications'>('chat');
  const { totalUnreadCount, getTotalUnreadCount } = useConversationStore();
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore(); // Assuming useSocketStore is available or import it. Wait, I should import useSocketStore correctly or check if useSocket hook returns it.

  // Initialize Socket connection
  useSocket();

  // Load total unread count on mount
  useEffect(() => {
    if (user) {
      getTotalUnreadCount();
    }
  }, [user, getTotalUnreadCount]);

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatPanel />;

      case 'friends':
        return <FriendsPanelMui />;

      case 'notifications':
        return <NotificationsPanelMui />;
      case 'settings':
        return <SettingsPanelMui />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <>
      <LayoutMui
        activeView={activeView}
        onViewChange={setActiveView}
        notificationCount={0}
        unreadMessageCount={totalUnreadCount}
      >
        {renderMainContent()}
      </LayoutMui>

      {/* Socket Debug Panel - Remove in production */}
      {/* <SocketDebugPanel /> */}
    </>
  );
};

export default ChatAppPage;
