import { useState } from "react";
import LayoutMui from "@/components/layout/Layout-mui";
import ChatPanel from "@/components/chat/ChatPanel";
import FriendsPanelMui from "@/components/friends/FriendsPanel-mui";
import NotificationsPanelMui from "@/components/notifications/NotificationsPanel-mui";
import SettingsPanelMui from "@/components/settings/SettingsPanel-mui";
import { useSocket } from "@/hooks/useSocket";
// import { SocketDebugPanel } from "@/components/debug/SocketDebugPanel";

const ChatAppPage = () => {
  const [activeView, setActiveView] = useState<'chat' | 'friends' | 'settings' | 'notifications'>('chat');
  
  // Initialize Socket connection
  useSocket();

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
        notificationCount={5}
      >
        {renderMainContent()}
      </LayoutMui>
      
      {/* Socket Debug Panel - Remove in production */}
      {/* <SocketDebugPanel /> */}
    </>
  );
};

export default ChatAppPage;
