import { useState, useEffect, useMemo } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { NewChatDialog } from "./NewChatDialog";
import { useConversationStore } from "@/stores/useConversationStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Conversation } from "@/types/message";
import type { Contact } from "../../types/chat";
import { formatTimestamp } from "@/utils/helper";
import { conversationService } from "@/services/conversationService";

const ChatPanel = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { user } = useAuthStore();
  const { isConnected, onlineUsers } = useSocketStore();
  const { friends, getFriendsList, loading: friendsLoading } = useFriendStore();
  const conversations = useConversationStore((state) => state.conversations);
  const getConversations = useConversationStore(
    (state) => state.getConversations
  );
  const searchConversations = useConversationStore(
    (state) => state.searchConversations
  );
  const clearSearchResults = useConversationStore(
    (state) => state.clearSearchResults
  );
  const setCurrentConversation = useConversationStore(
    (state) => state.setCurrentConversation
  );
  const _updateConversation = useConversationStore(
    (state) => state._updateConversation
  );
  const {
    messages,
    sendMessage,
    getMessages,
    joinConversation,
    leaveConversation,
  } = useMessageStore();

  // ✅ Load conversations và friends khi connected
  useEffect(() => {
    if (isConnected && user) {
      console.log("📋 ChatPanel: Loading conversations and friends");
      getConversations();
      getFriendsList(); // ✅ Load friends list để check friendship
    }
  }, [isConnected, user]);

  // ✅ Join TẤT CẢ conversation rooms khi có conversations
  useEffect(() => {
    if (conversations.length > 0 && isConnected) {
      console.log("🔗 Joining ALL conversation rooms:", conversations.length);
      conversations.forEach((conv) => {
        joinConversation(conv._id);
        console.log("✅ Joined room for conversation:", conv._id);
      });
    }
  }, [conversations, isConnected]); // ✅ Theo dõi conversations array, không chỉ length

  // Load messages khi chọn conversation
  useEffect(() => {
    if (selectedConversation && isConnected) {
      // ✅ Join conversation room để nhận real-time updates
      joinConversation(selectedConversation._id);

      getMessages(selectedConversation._id);

      // ✅ Reset unread count khi mở conversation
      if (
        selectedConversation.unreadCount &&
        selectedConversation.unreadCount > 0
      ) {
        // ✅ Update local state ngay lập tức (optimistic update)
        _updateConversation(selectedConversation._id, { unreadCount: 0 });

        // ✅ Gọi API để persist vào database
        conversationService.resetUnreadCount({
          conversationId: selectedConversation._id,
        });
      }
      // ✅ Leave room khi unmount hoặc chuyển conversation
      return () => {
        leaveConversation(selectedConversation._id);
      };
    }
  }, [
    selectedConversation?._id,
    isConnected,
    joinConversation,
    getMessages,
    leaveConversation,
  ]);
  // Tự động đánh dấu đã đọc khi có tin nhắn mới đến TRONG conversation đang mở
  useEffect(() => {
    if (!selectedConversation || !isConnected) {
      return;
    }

    const currentMessages = messages[selectedConversation._id] || [];
    if (currentMessages.length === 0) {
      console.log("🔴 Skip auto-mark-read: no messages");
      return;
    }

    //lấy tin nhắn mới nhất
    const latestMessage = currentMessages[currentMessages.length - 1];

    //Nếu tin nhắn mới nhất không phải do user gửi thì đánh dấu đã đọc
    if (latestMessage && latestMessage.senderId._id !== user?._id) {
      // ✅ Tìm conversation hiện tại để check unreadCount từ store (có thể đã được cập nhật bởi NEW_MESSAGE event)
      const currentConv = conversations.find(
        (c) => c._id === selectedConversation._id
      );
      console.log(
        "🔵 Current conversation unreadCount:",
        currentConv?.unreadCount
      );

      if (
        currentConv &&
        currentConv.unreadCount &&
        currentConv.unreadCount > 0
      ) {
        console.log(
          "📖 Đánh dấu đã đọc - tin nhắn mới trong conversation đang mở"
        );

        // ✅ Cập nhật local state
        _updateConversation(selectedConversation._id, { unreadCount: 0 });

        // ✅ Gọi API để persist vào database
        conversationService.resetUnreadCount({
          conversationId: selectedConversation._id,
        });
      } else {
        console.log(
          "🔴 Skip auto-mark-read: unreadCount is 0 or conversation not found"
        );
      }
    }
  }, [
    messages,
    selectedConversation?._id,
    isConnected,
    user?._id,
    conversations,
    _updateConversation,
  ]);

  // ✅ Detect khi conversation đang xem bị xóa (user unfriend)
  useEffect(() => {
    if (selectedConversation) {
      const stillExists = conversations.find(c => c._id === selectedConversation._id);
      if (!stillExists) {
        console.log("🔴 Conversation đã bị xóa, clear selection");
        setSelectedConversation(null);
        setCurrentConversation(null);
      }
    }
  }, [conversations, selectedConversation]);

  // Convert Conversation to Contact format cho UI
  const contacts = useMemo((): Contact[] => {
    return conversations
      .filter(conv => conv.isActive) // ✅ Chỉ hiển thị conversation active
      .map((conv) => {
        const otherUser = conv.participants.find((p) => p._id !== user?._id);
        if (!otherUser) return null;

        // ✅ Check if other user is online
        const isOnline = onlineUsers.includes(otherUser._id);

        return {
          id: conv._id,
          name: otherUser.displayName || otherUser.username,
          avatar: otherUser.avatar,
          lastMessage: conv.lastMessage?.content || "Bắt đầu cuộc trò chuyện",
          timestamp: conv.lastMessage
            ? formatTimestamp(conv.lastMessage.sentAt)
            : "",
          isOnline,
          unreadCount: conv.unreadCount || 0,
        };
      })
      .filter(Boolean) as Contact[];
  }, [conversations, onlineUsers, user]);

  const handleContactSelect = (contact: Contact) => {
    const conversation = conversations.find((c) => c._id === contact.id);
    if (conversation) {
      setSelectedConversation(conversation);
      setCurrentConversation(conversation); // Set to store
    }
  };

  const handleSendMessage = (content: string) => {
    if (content.trim() && selectedConversation) {
      console.log("📤 Sending message:", content);

      // Tìm receiverId (người nhận là participant khác không phải user)
      const receiver = selectedConversation.participants.find(
        (p) => p._id !== user?._id
      );
      if (!receiver) return;

      sendMessage({
        conversationId: selectedConversation._id,
        receiverId: receiver._id,
        content: content,
        type: "text",
      });
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

  const selectedContact = selectedConversation
    ? contacts.find((c) => c.id === selectedConversation._id) || null
    : null;

  // Convert Message[] từ backend sang format UI
  const uiMessages = useMemo(() => {
    if (!selectedConversation) return [];

    const backendMessages = messages[selectedConversation._id] || [];
    return backendMessages.map((msg) => ({
      id: msg._id,
      content: msg.content,
      sender: msg.senderId.displayName || msg.senderId.username,
      timestamp: new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: msg.senderId._id === user?._id,
    }));
  }, [messages, selectedConversation, user]);

  // ✅ Check xem conversation partner có phải bạn bè không
  const isFriend = useMemo(() => {
    if (!selectedConversation || !user) {
      return true;
    }

    // Tìm người còn lại trong conversation
    const otherUser = selectedConversation.participants.find(
      (p) => p._id !== user._id
    );
    if (!otherUser) {
      return true;
    }

    // ⚠️ Nếu đang load friends → default true (chưa biết chắc)
    if (friendsLoading) {
      return true;
    }

    // ✅ Nếu đã load xong friends → check trong list
    // Nếu friends.length = 0 → user không có bạn nào → otherUser chắc chắn không phải bạn
    // Nếu friends.length > 0 → check có trong list không
    const result = friends.some((friend) => friend._id === otherUser._id);
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
          onSendMessage={handleSendMessage}
          isFriend={isFriend}
          isActive={selectedConversation?.isActive ?? true}
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
