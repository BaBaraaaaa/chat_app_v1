import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Smile, Send } from "lucide-react";

interface MessageInputProps {
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const MessageInput = ({
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onKeyPress,
}: MessageInputProps) => {
  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={onSendMessage} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;