import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import type { Message, Contact } from "../../types/chat";

const MobileChatPanel = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatList, setShowChatList] = useState(true);

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
    {
      id: "4",
      name: "Phạm Thị D",
      lastMessage: "Hẹn gặp lại sau!",
      timestamp: "2 ngày trước",
      isOnline: false,
    },
    {
      id: "5",
      name: "Hoàng Văn E",
      lastMessage: "Cảm ơn bạn đã giúp đỡ",
      timestamp: "3 ngày trước",
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
    {
      id: "4",
      content: "Mình định đi cafe với bạn bè, bạn có muốn tham gia không?",
      sender: "Nguyễn Văn A",
      timestamp: "10:31",
      isOwn: false,
    },
    {
      id: "5",
      content: "Được đấy! Mấy giờ và ở đâu vậy?",
      sender: "Tôi",
      timestamp: "10:32",
      isOwn: true,
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

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChatList(false);
  };

  const handleBackToChatList = () => {
    setSelectedContact(null);
    setShowChatList(true);
  };

  return (
    <div className="flex-1 flex md:hidden">
      {showChatList ? (
        <ChatSidebar
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
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
              <h2 className="font-semibold">{selectedContact?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedContact?.isOnline ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            </div>
          </div>
          
          {/* Chat Area */}
          <ChatArea
            selectedContact={selectedContact}
            messages={messages}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      )}
    </div>
  );
};

export default MobileChatPanel;