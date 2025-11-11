import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import type { Message, Contact } from "../../types/chat";
import { useMessageStore } from "@/stores/useMessageStore";

interface MessageListProps {
  messages: Message[];
  selectedContact: Contact;
}

const MessageList = ({ messages, selectedContact }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { loading, typingUsers } = useMessageStore();

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Safe access to typingUsers - ensure it's an array
  const typingUsersInConversation = selectedContact?.id 
    ? (typingUsers[selectedContact.id] || [])
    : [];

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
              {!message.isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {selectedContact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsersInConversation.length > 0 && (
          <div className="flex items-start gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-muted text-xs">
                {selectedContact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="px-4 py-2 rounded-2xl bg-muted">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm mt-2">Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;