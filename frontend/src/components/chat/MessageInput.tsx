import { memo, useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useMessageStore } from "@/stores/useMessageStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { AttachButton, EmojiButton, SendButton } from "./MessageInputButtons";
import EditModeBanner from "./EditModeBanner";

interface MessageInputProps {
  initialValue?: string; // Chỉ dùng để set giá trị ban đầu khi edit
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  editingMessageId?: string | null;
  onCancelEdit?: () => void;
}

const MessageInput = memo(function MessageInput({
  initialValue = "",
  onSendMessage,
  disabled = false,
  editingMessageId,
  onCancelEdit,
}: MessageInputProps) {
  const { startTyping, stopTyping } = useMessageStore();
  const { currentConversation } = useConversationStore();
  const { user } = useAuthStore();

  const [localValue, setLocalValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeRAF = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  /** Sync khi initialValue thay đổi (chỉ khi edit) */
  useEffect(() => {
    if (editingMessageId && initialValue) {
      setLocalValue(initialValue);
    } else if (!editingMessageId) {
      // Clear khi không edit
      setLocalValue("");
    }
  }, [editingMessageId, initialValue]);

  /** Auto resize textarea */
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (resizeRAF.current) cancelAnimationFrame(resizeRAF.current);
    resizeRAF.current = requestAnimationFrame(() => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      resizeRAF.current = null;
    });
  }, []);

  useEffect(() => {
    resizeTextarea();
    return () => {
      if (resizeRAF.current) cancelAnimationFrame(resizeRAF.current);
    };
  }, [localValue, resizeTextarea]);

  /** Handle input change */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setLocalValue(val);
      
      // KHÔNG sync với parent - chỉ update local state

      if (!currentConversation || !user) return;
      const receiver = currentConversation.participants.find(p => p._id !== user._id);
      if (!receiver) return;

      if (!isTypingRef.current) {
        startTyping(currentConversation._id, receiver._id);
        isTypingRef.current = true;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentConversation._id, receiver._id);
        isTypingRef.current = false;
      }, 1000);
    },
    [currentConversation, user, startTyping, stopTyping]
  );

  /** Gửi tin nhắn */
  const handleSend = useCallback(() => {
    const text = localValue.trim();
    if (!text) return;
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Stop typing ngay lập tức
    if (isTypingRef.current && currentConversation && user) {
      const receiver = currentConversation.participants.find(p => p._id !== user._id);
      if (receiver) {
        stopTyping(currentConversation._id, receiver._id);
        isTypingRef.current = false;
      }
    }
    
    // Gửi tin nhắn với content
    onSendMessage(text);
    
    // Clear local value sau khi gửi
    setLocalValue("");
  }, [localValue, onSendMessage, currentConversation, user, stopTyping]);

  /** Enter để gửi */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation(); // Ngăn event bubble lên parent
        handleSend();
      }
    },
    [handleSend]
  );

  /** Cleanup */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (resizeRAF.current) cancelAnimationFrame(resizeRAF.current);
    };
  }, []);

  return (
    <div className="p-4 border-t border-border bg-card rounded-t-lg shadow-inner">
      {editingMessageId && <EditModeBanner onCancel={onCancelEdit} />}

      <div className="flex items-center gap-2">
        <AttachButton disabled={disabled} />

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled ? "Không thể gửi tin nhắn..." : editingMessageId ? "Chỉnh sửa tin nhắn..." : "Nhập tin nhắn..."
            }
            className="pr-12 min-h-[44px] max-h-[200px] resize-none rounded-lg border border-border focus:ring-2 focus:ring-primary transition overflow-hidden"
            rows={1}
          />
          <EmojiButton disabled={disabled} />
        </div>

        <SendButton 
          disabled={disabled} 
          canSend={!!localValue.trim()} 
          onSend={handleSend} 
        />
      </div>
    </div>
  );
});

MessageInput.displayName = "MessageInput";
export default MessageInput;
