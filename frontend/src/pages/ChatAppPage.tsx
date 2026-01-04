import { useState, useEffect } from "react";
import LayoutMui from "@/components/layout/Layout-mui";
import ChatPanel from "@/components/chat/ChatPanel";
import FriendsPanelMui from "@/components/friends/FriendsPanel-mui";
import NotificationsPanelMui from "@/components/notifications/NotificationsPanel-mui";
import SettingsPanelMui from "@/components/settings/SettingsPanel-mui";
import { useSocket } from "@/hooks/useSocket";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";

import { useGroupInvitationStore } from "@/stores/useGroupInvitationStore";
import { useFriendStore } from "@/stores/useFriendStore";

const ChatAppPage = () => {
  const [activeView, setActiveView] = useState<'chat' | 'friends' | 'settings' | 'notifications'>('chat');
  const { totalUnreadCount, getTotalUnreadCount } = useConversationStore();
  const { user } = useAuthStore();
  const { receivedInvitations } = useGroupInvitationStore();
  const { receivedRequests } = useFriendStore();

  const totalNotifications = receivedRequests.length + receivedInvitations.length;

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
        notificationCount={totalNotifications}
        unreadMessageCount={totalUnreadCount}
      >
        {renderMainContent()}
      </LayoutMui>

    </>
  );
};

export default ChatAppPage;
