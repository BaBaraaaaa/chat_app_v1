import { useState, useEffect, useMemo } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { NewChatDialog } from "./NewChatDialog";
import { useConversationStore } from "@/stores/useConversationStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { conversationService } from "@/services/conversationService";
import type { Conversation } from "@/types/message";
import type { Contact } from "../../types/chat";

const ChatPanel = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const { friends, getFriendsList, loading: friendsLoading } = useFriendStore(); // ✅ Thêm loading state
  
  // ✅ Tách từng selector riêng để tránh re-render không cần thiết
  const conversations = useConversationStore((state) => state.conversations);
  const getConversations = useConversationStore((state) => state.getConversations);
  const searchConversations = useConversationStore((state) => state.searchConversations);
  const clearSearchResults = useConversationStore((state) => state.clearSearchResults);
  const setCurrentConversation = useConversationStore((state) => state.setCurrentConversation);
  const _updateConversation = useConversationStore((state) => state._updateConversation);

  const {
    messages,
    sendMessage,
    getMessages,
    joinConversation,
    leaveConversation,
  } = useMessageStore();

  // ✅ Load conversations và friends khi connected
  useEffect(() => {
    console.log("🔍 ChatPanel useEffect - isConnected:", isConnected, "user:", user?.username);
    
    if (isConnected && user) {
      console.log("📋 ChatPanel: Loading conversations and friends");
      getConversations();
      getFriendsList(); // ✅ Load friends list để check friendship
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, user]); // ✅ Chỉ depend vào isConnected và user

  // ✅ Join TẤT CẢ conversation rooms khi có conversations
  useEffect(() => {
    if (conversations.length > 0 && isConnected) {
      console.log("🔗 Joining ALL conversation rooms:", conversations.length);
      conversations.forEach((conv) => {
        joinConversation(conv._id);
        console.log("✅ Joined room for conversation:", conv._id);
      });
    }
  }, [conversations.length, isConnected, joinConversation]);

  // Load messages khi chọn conversation
  useEffect(() => {
    console.log("🔍 Load messages useEffect - selectedConversation:", selectedConversation?._id, "isConnected:", isConnected);
    
    if (selectedConversation && isConnected) {
      console.log("📥 Loading messages for conversation:", selectedConversation._id);
      
      // ✅ Join conversation room để nhận real-time updates
      joinConversation(selectedConversation._id);
      
      getMessages(selectedConversation._id);

      // ✅ Reset unread count khi mở conversation
      if (selectedConversation.unreadCount && selectedConversation.unreadCount > 0) {
        
        // ✅ Update local state ngay lập tức (optimistic update)
        _updateConversation(selectedConversation._id, { unreadCount: 0 });
        
        // ✅ Gọi API để persist vào database
        conversationService.resetUnreadCount({
          conversationId: selectedConversation._id
        });
      }

      // ✅ Leave room khi unmount hoặc chuyển conversation
      return () => {
        leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation?._id, isConnected]);

  // Convert Conversation to Contact format cho UI
  const convertToContacts = (): Contact[] => {
    return conversations.map((conv) => {
      const otherUser = conv.participants.find((p) => p._id !== user?._id);
      if (!otherUser) return null;

      return {
        id: conv._id,
        name: otherUser.displayName || otherUser.username,
        avatar: otherUser.avatar,
        lastMessage: conv.lastMessage?.content || "Bắt đầu cuộc trò chuyện",
        timestamp: conv.lastMessage ? formatTimestamp(conv.lastMessage.sentAt) : "",
        isOnline: false, // Sẽ implement online status sau
        unreadCount: conv.unreadCount || 0,
      };
    }).filter(Boolean) as Contact[];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleContactSelect = (contact: Contact) => {
    const conversation = conversations.find((c) => c._id === contact.id);
    if (conversation) {
      setSelectedConversation(conversation);
      setCurrentConversation(conversation); // Set to store
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      console.log("📤 Sending message:", messageInput);
      
      // Tìm receiverId (người nhận là participant khác không phải user)
      const receiver = selectedConversation.participants.find((p) => p._id !== user?._id);
      if (!receiver) return;

      sendMessage({
        conversationId: selectedConversation._id,
        receiverId: receiver._id,
        content: messageInput,
        type: "text",
      });
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      clearSearchResults();
    }
  };

  const contacts = convertToContacts();
  const selectedContact = selectedConversation
    ? contacts.find((c) => c.id === selectedConversation._id) || null
    : null;

  // Convert Message[] từ backend sang format UI
  const convertToUIMessages = () => {
    if (!selectedConversation) return [];
    
    const backendMessages = messages[selectedConversation._id] || [];
    return backendMessages.map((msg) => ({
      id: msg._id,
      content: msg.content,
      sender: msg.senderId.displayName || msg.senderId.username,
      timestamp: new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isOwn: msg.senderId._id === user?._id,
    }));
  };

  const uiMessages = convertToUIMessages();

  // ✅ Check xem conversation partner có phải bạn bè không
  const isFriend = useMemo(() => {
    if (!selectedConversation || !user) {
      console.log("🔍 isFriend check: No conversation or user, default true");
      return true;
    }
    
    // Tìm người còn lại trong conversation
    const otherUser = selectedConversation.participants.find(p => p._id !== user._id);
    if (!otherUser) {
      console.log("🔍 isFriend check: No other user found, default true");
      return true;
    }
    
    // ⚠️ Nếu đang load friends → default true (chưa biết chắc)
    if (friendsLoading) {
      console.log("🔍 isFriend check: Friends loading, default true");
      return true;
    }
    
    console.log("🔍 isFriend check:", {
      otherUserId: otherUser._id,
      otherUserName: otherUser.displayName,
      friendsCount: friends.length,
      friendIds: friends.map(f => f._id),
      friendsLoading
    });
    
    // ✅ Nếu đã load xong friends → check trong list
    // Nếu friends.length = 0 → user không có bạn nào → otherUser chắc chắn không phải bạn
    // Nếu friends.length > 0 → check có trong list không
    const result = friends.some(friend => friend._id === otherUser._id);
    console.log("🔍 isFriend result:", result);
    return result;
  }, [selectedConversation, user, friends, friendsLoading]);

  const handleNewChat = () => {
    setNewChatOpen(true);
  };

  const handleConversationCreated = (userId: string) => {
    // Find the created conversation
    setTimeout(() => {
      const newConv = conversations.find((c) =>
        c.participants.some((p) => p._id === userId)
      );
      if (newConv) {
        setSelectedConversation(newConv);
        setCurrentConversation(newConv);
      }
    }, 1000);
  };

  return (
    <>
      {/* Chat Panel */}
      <div className="flex flex-1">
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onNewChat={handleNewChat}
        />
        <ChatArea
          selectedContact={selectedContact}
          messages={uiMessages}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isFriend={isFriend} // ✅ Pass friendship status
        />
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
};

export default ChatPanel;