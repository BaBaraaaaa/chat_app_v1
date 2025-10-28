import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import type { Message, Contact } from "../types/chat";

const ChatAppPage = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const contacts: Contact[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      lastMessage: "Chào bạn! Hôm nay có khỏe không?",
      timestamp: "10:30",
      isOnline: true,
      unreadCount: 2,
    },
    {
      id: "2",
      name: "Trần Thị B",
      lastMessage: "Cảm ơn bạn rất nhiều!",
      timestamp: "09:15",
      isOnline: false,
    },
    {
      id: "3",
      name: "Lê Văn C",
      lastMessage: "Gặp nhau vào thứ 2 nhé",
      timestamp: "Hôm qua",
      isOnline: true,
      unreadCount: 1,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      content: "Chào bạn!",
      sender: "Nguyễn Văn A",
      timestamp: "10:25",
      isOwn: false,
    },
    {
      id: "2",
      content: "Chào! Mình khỏe, còn bạn thế nào?",
      sender: "Tôi",
      timestamp: "10:26",
      isOwn: true,
    },
    {
      id: "3",
      content: "Mình cũng khỏe. Hôm nay có dự định gì không?",
      sender: "Nguyễn Văn A",
      timestamp: "10:30",
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex">
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onContactSelect={setSelectedContact}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ChatArea
        selectedContact={selectedContact}
        messages={messages}
        messageInput={messageInput}
        onMessageInputChange={setMessageInput}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};

export default ChatAppPage;
