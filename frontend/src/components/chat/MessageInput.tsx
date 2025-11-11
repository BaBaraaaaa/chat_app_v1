import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Smile, Send } from "lucide-react";
import { useCallback, useRef } from "react";
import { useMessageStore } from "@/stores/useMessageStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessageInputProps {
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean; // ✅ Thêm prop disabled
}

const MessageInput = ({
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onKeyPress,
  disabled = false, // ✅ Default false
}: MessageInputProps) => {
  const { startTyping, stopTyping } = useMessageStore();
  const { currentConversation } = useConversationStore();
  const { user } = useAuthStore();
  const typingTimeoutRef = useRef<number | null>(null);

  // Handle typing indicator
  const handleInputChange = useCallback((value: string) => {
    onMessageInputChange(value);

    if (!currentConversation || !user) return;

    // Tìm receiverId
    const receiver = currentConversation.participants.find((p) => p._id !== user._id);
    if (!receiver) return;

    // Start typing
    startTyping(currentConversation._id, receiver._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2s không gõ
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(currentConversation._id, receiver._id);
    }, 1000);
  }, [currentConversation, user, onMessageInputChange, startTyping, stopTyping]);

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder={disabled ? "Không thể gửi tin nhắn..." : "Nhập tin nhắn..."}
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="pr-10"
            disabled={disabled} // ✅ Disable input
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={onSendMessage} size="icon" disabled={disabled}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;