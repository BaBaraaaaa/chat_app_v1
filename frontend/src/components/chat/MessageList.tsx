import { useEffect, useRef, useState, useLayoutEffect, memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import type { Message, Contact } from "../../types/chat";
import { useMessageStore } from "@/stores/useMessageStore";
import { useConversationStore } from "@/stores/useConversationStore";
import { conversationService } from "@/services/conversationService";
import MessageItem from "./MessageItem";
import type { Message as MessageType } from "@/types/message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Memoized typing indicator
const TypingIndicator = memo(({ userInitial }: { userInitial: string }) => (
  <div className="flex items-start gap-2">
    <Avatar className="w-8 h-8">
      <AvatarFallback className="bg-muted text-xs">{userInitial}</AvatarFallback>
    </Avatar>
    <div className="px-4 py-2 rounded-2xl bg-muted">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
));

interface MessageListProps {
  messages: Message[];
  selectedContact: Contact;
  onEditMessage?: (messageId: string, content: string) => void;
}

const MessageList = ({ messages, selectedContact, onEditMessage }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { loading, typingUsers, deleteMessage, unreadCount } = useMessageStore();
  const { _updateConversation } = useConversationStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessageCountRef = useRef(messages.length);

  const currentUnreadCount = unreadCount[selectedContact.id] || 0;

  // Track new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isAtBottom) {
      setHasNewMessages(true);
    }
    if (isAtBottom) setHasNewMessages(false);
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  // Debounced scroll check
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    let timeout: number;
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const atBottom = distanceFromBottom < 150;
        
        setIsAtBottom(atBottom);
        
        // ✅ Đánh dấu đã đọc khi ở cuối và có tin nhắn chưa đọc
        if (atBottom && currentUnreadCount > 0) {
          console.log("🔵 Marking as read - scroll at bottom, unreadCount:", currentUnreadCount);
          _updateConversation(selectedContact.id, { unreadCount: 0 });
          conversationService.resetUnreadCount({
            conversationId: selectedContact.id,
          });
        }
      }, 50);
    };

    scrollArea.addEventListener("scroll", handleScroll);
    
    // Kiểm tra ngay lập tức khi mount hoặc khi unreadCount thay đổi
    handleScroll();
    
    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [currentUnreadCount, selectedContact.id, _updateConversation]);

  // Scroll to bottom when needed
  useLayoutEffect(() => {
    if (!isAtBottom || loading || messages.length === 0) return;
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
  }, [messages.length, isAtBottom, loading]);

  // Typing users for this conversation
  const typingUsersInConversation = selectedContact?.id
    ? typingUsers[selectedContact.id]?.slice(0, 3) || []
    : [];

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleEditClick = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && onEditMessage) onEditMessage(messageId, message.content);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 relative" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const messageData: MessageType = {
              _id: message.id,
              conversationId: selectedContact.id,
              senderId: message.isOwn
                ? { _id: "", username: "You", displayName: "You" }
                : { _id: selectedContact.id, username: selectedContact.name, displayName: selectedContact.name },
              content: message.content,
              type: "text",
              status: "delivered",
              createdAt: message.timestamp,
              updatedAt: message.timestamp,
              isEdited: false,
              isDeleted: false,
            };

            return (
              <MessageItem
                key={message.id}
                message={messageData}
                isOwn={message.isOwn}
                senderName={selectedContact.name}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            );
          })}

          {typingUsersInConversation.length > 0 &&
            typingUsersInConversation.map((u,index) => (
              <TypingIndicator key={index} userInitial={selectedContact.name.charAt(0)} />
            ))}

          {messages.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chưa có tin nhắn nào</p>
              <p className="text-sm mt-2">Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
            </div>
          )}
        </div>
      </div>

      {!isAtBottom && hasNewMessages && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <button
            onClick={() => {
              const el = scrollAreaRef.current;
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            }}
            className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl flex items-center gap-2 pointer-events-auto"
          >
            <span className="flex items-center gap-2">
              {currentUnreadCount > 0 && (
                <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {currentUnreadCount}
                </span>
              )}
              Tin nhắn mới
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default memo(MessageList);
