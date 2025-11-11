import { useState } from "react";
import Layout from "@/components/layout/Layout";
import ChatPanel from "@/components/chat/ChatPanel";
import FriendsPanel from "@/components/friends/FriendsPanel";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";
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
        return <FriendsPanel />;

      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <>
      <Layout
        activeView={activeView}
        onViewChange={setActiveView}
        notificationCount={5}
      >
        {renderMainContent()}
      </Layout>
      
      {/* Socket Debug Panel - Remove in production */}
      {/* <SocketDebugPanel /> */}
    </>
  );
};

export default ChatAppPage;
