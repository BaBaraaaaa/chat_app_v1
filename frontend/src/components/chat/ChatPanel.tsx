import { useState, useEffect, useMemo, useRef } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import ConversationListMui from "./ConversationList-mui";
import ChatAreaMui from "./ChatArea-mui";
import { NewChatDialogMui } from "./NewChatDialog-mui";
import { useConversationStore } from "@/stores/useConversationStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Conversation } from "@/types/message";
import type { Contact } from "../../types/chat";
import { conversationApiService } from "@/services/conversationApiService";

const ChatPanel = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const joinedConversationsRef = useRef<Set<string>>(new Set());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useAuthStore();
  const { isConnected, onlineUsers } = useSocketStore();
  const { friends, getFriendsList, loading: friendsLoading } = useFriendStore();
  const {
    conversations,
    getConversations,
    setCurrentConversation,
    _updateConversation,
  } = useConversationStore();
  const { messages, sendMessage, getMessages, joinConversation, getMessagesByCursor } =
    useMessageStore();

  // ✅ Load conversations và friends khi connected
  useEffect(() => {
    if (isConnected && user) {
      getConversations();
      getFriendsList(); // ✅ Load friends list để check friendship
    }
  }, [isConnected, user, getConversations, getFriendsList]);


  // Load messages khi chọn conversation
  useEffect(() => {
    if (selectedConversation && isConnected) {
      // ✅ Join conversation room nếu chưa join (đảm bảo nhận real-time updates)
      if (!joinedConversationsRef.current.has(selectedConversation._id)) {
        joinConversation(selectedConversation._id);
        joinedConversationsRef.current.add(selectedConversation._id);
      }

      // getMessages(selectedConversation._id);
      getMessagesByCursor(selectedConversation._id)
      // ✅ Reset unread count khi mở conversation
      if (
        selectedConversation.unreadCount &&
        selectedConversation.unreadCount > 0
      ) {
        // ✅ Update local state ngay lập tức (optimistic update)
        _updateConversation(selectedConversation._id, { unreadCount: 0 });

        // ✅ Gọi API để persist vào database
        // conversationService.resetUnreadCount({
        //   conversationId: selectedConversation._id,
        // });
        conversationApiService.resetUnreadCount(selectedConversation._id);
      }
    }
  }, [
    selectedConversation?._id,
    isConnected,
    joinConversation,
    getMessages,
    getMessagesByCursor,
    _updateConversation,
  ]);
  // Tự động đánh dấu đã đọc khi có tin nhắn mới đến TRONG conversation đang mở
  useEffect(() => {
    if (!selectedConversation || !isConnected) {
      return;
    }

    const currentMessages = messages[selectedConversation._id] || [];
    if (currentMessages.length === 0) {
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

      if (
        currentConv &&
        currentConv.unreadCount &&
        currentConv.unreadCount > 0
      ) {
        // ✅ Cập nhật local state
        _updateConversation(selectedConversation._id, { unreadCount: 0 });

        // ✅ Gọi API để persist vào database
        conversationApiService.resetUnreadCount(selectedConversation._id);
      } else {
        return;
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
      const stillExists = conversations.find(
        (c) => c._id === selectedConversation._id
      );
      if (!stillExists) {
        setSelectedConversation(null);
        setCurrentConversation(null);
      }
    }
  }, [conversations, selectedConversation]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setCurrentConversation(conversation); // Set to store
  };

  const handleSendMessage = (content: string) => {
    if (content.trim() && selectedConversation) {
      // Tìm receiverId (người nhận là participant khác không phải user)
      const receiver = selectedConversation.participants.find(
        (p) => p._id !== user?._id
      );
      if (!receiver) {
        console.error("❌ No receiver found in conversation");
        return;
      }

      const payload = {
        conversationId: selectedConversation._id,
        receiverId: receiver._id,
        content: content,
        type: "text" as const,
      };
      sendMessage(payload);
    } else {
      return ;
    }
  };

  // Convert Message[] từ backend - giữ nguyên format từ store
  const uiMessages = useMemo(() => {
    if (!selectedConversation) return [];

    const backendMessages = messages[selectedConversation._id] || [];
    return backendMessages; // Truyền trực tiếp, không cần convert
  }, [messages, selectedConversation]);

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

  const handleMobileBack = () => {
    if (isMobile) {
      setSelectedConversation(null);
      setCurrentConversation(null);
    }
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

  // Convert to Contact for ChatAreaMui compatibility
  const selectedContact = useMemo((): Contact | null => {
    if (!selectedConversation) return null;

    const otherUser = selectedConversation.participants.find(
      (p) => p._id !== user?._id
    );
    if (!otherUser) return null;

    const isOnline = onlineUsers.includes(otherUser._id);

    return {
      id: selectedConversation._id,
      name: otherUser.displayName || otherUser.username,
      avatarUrl: otherUser.avatarUrl,
      lastMessage:
        selectedConversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện",
      timestamp: selectedConversation.lastMessage
        ? new Date(selectedConversation.lastMessage.sentAt).toLocaleTimeString(
            "vi-VN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "",
      isOnline,
      unreadCount: selectedConversation.unreadCount || 0,
    };
  }, [selectedConversation, user, onlineUsers]);

  return (
    <>
      {/* Chat Panel */}
      <Box
        sx={{ 
          display: "flex", 
          flex: 1, 
          overflow: "hidden", 
          height: "100%",
          // position: 'relative'
        }}
      >
        {/* Conversation List - Desktop & Tablet */}
        {!isMobile && (
          <Box>
            <ConversationListMui
              onSelectConversation={handleConversationSelect}
              onNewChat={handleNewChat}
            />
          </Box>
        )}

        {/* Mobile Conversation List */}
        {isMobile && !selectedConversation && (
          <Box sx={{ width: '100%' }}>
            <ConversationListMui
              onSelectConversation={handleConversationSelect}
              onNewChat={handleNewChat}
            />
          </Box>
        )}

        {/* Chat Area */}
        {(!isMobile || selectedConversation) && (
            <ChatAreaMui
              selectedContact={selectedContact}
              messages={uiMessages}
              onSendMessage={handleSendMessage}
              isFriend={isFriend}
              isActive={selectedConversation?.isActive ?? true}
              onMobileBack={isMobile ? handleMobileBack : undefined}
              isMobile={isMobile}
            />
        )}
      </Box>

      {/* New Chat Dialog */}
      <NewChatDialogMui
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
};

export default ChatPanel;
