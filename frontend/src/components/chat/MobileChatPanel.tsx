import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { NewChatDialog } from "./NewChatDialog";
import { useConversationStore } from "@/stores/useConversationStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/message";
import type { Contact } from "../../types/chat";

const MobileChatPanel = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { user } = useAuthStore();
  const { conversations, setCurrentConversation, searchConversations, clearSearchResults } = useConversationStore();
  const { messages, sendMessage, joinConversation, leaveConversation, getMessages, setupSocketListeners } = useMessageStore();

  // ✅ Setup listeners 1 lần khi component mount
  useEffect(() => {
    setupSocketListeners();
  }, []);

  // ✅ Load messages và join room khi chọn conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log("📥 Mobile: Loading messages for conversation:", selectedConversation._id);
      
      joinConversation(selectedConversation._id);
      getMessages(selectedConversation._id);

      return () => {
        leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation?._id]);

  // Convert Conversation to Contact format
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
        isOnline: false,
        unreadCount: conv.unreadCount || 0,
      };
    }).filter(Boolean) as Contact[];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("vi-VN");
  };

  // Convert backend messages to UI format
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

  const contacts = convertToContacts();
  const selectedContact = selectedConversation
    ? contacts.find((c) => c.id === selectedConversation._id) || null
    : null;
  const uiMessages = convertToUIMessages();

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
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

  const handleContactSelect = (contact: Contact) => {
    const conversation = conversations.find((c) => c._id === contact.id);
    if (conversation) {
      setSelectedConversation(conversation);
      setCurrentConversation(conversation);
      setShowChatList(false);
    }
  };

  const handleBackToChatList = () => {
    setSelectedConversation(null);
    setCurrentConversation(null);
    setShowChatList(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      clearSearchResults();
    }
  };

  const handleNewChat = () => {
    setNewChatOpen(true);
  };

  const handleConversationCreated = (userId: string) => {
    setTimeout(() => {
      const newConv = conversations.find((c) =>
        c.participants.some((p) => p._id === userId)
      );
      if (newConv) {
        setSelectedConversation(newConv);
        setCurrentConversation(newConv);
        setShowChatList(false);
      }
    }, 1000);
  };

  return (
    <>
      <div className="flex-1 flex md:hidden">
        {showChatList ? (
          <ChatSidebar
            contacts={contacts}
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onNewChat={handleNewChat}
          />
        ) : selectedContact ? (
          <div className="flex-1 flex flex-col">
            {/* Mobile Chat Header with Back Button */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToChatList}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h2 className="font-semibold">{selectedContact.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedContact.isOnline ? "Đang hoạt động" : "Không hoạt động"}
                </p>
              </div>
            </div>
            
            {/* Chat Area */}
            <ChatArea
              selectedContact={selectedContact}
              messages={uiMessages}
              messageInput={messageInput}
              onMessageInputChange={setMessageInput}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Chọn cuộc trò chuyện</p>
            </div>
          </div>
        )}
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

export default MobileChatPanel;