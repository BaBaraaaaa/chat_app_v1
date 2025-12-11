import { useRef, useEffect, useState, useLayoutEffect, memo } from "react";
import {
  Box,
  Avatar,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import type { Message } from "@/types/message";
import MessageItemMui from "./MessageItem-mui";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useConversationStore } from "@/stores/useConversationStore";
// import { conversationService } from "@/socket/conversationService";

interface MessageListProps {
  messages: Message[];
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

// Memoized typing indicator
const TypingIndicator = memo(({ userInitial, userAvatar }: { userInitial: string; userAvatar?: string }) => (
  <Box sx={{ display: "flex", alignItems: "start", gap: 1, mb: 1 }}>
    <Avatar
      src={userAvatar}
      alt={userInitial}
      sx={{ width: 32, height: 32, bgcolor: "grey.400", fontSize: "0.875rem" }}
    >
      {userInitial}
    </Avatar>
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: "16px 16px 16px 4px",
        bgcolor: "grey.100",
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              bgcolor: "grey.600",
              borderRadius: "50%",
              animation: "bounce 1.4s infinite ease-in-out both",
              animationDelay: `${i * 150}ms`,
              "@keyframes bounce": {
                "0%, 80%, 100%": { transform: "scale(0)" },
                "40%": { transform: "scale(1)" },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  </Box>
));

function MessageListMui({ messages, onEdit, onDelete }: MessageListProps) {
  const { user } = useAuthStore();
  const { loading, typingUsers, deleteMessage, unreadCount } =
    useMessageStore();
  const { currentConversation, _updateConversation } = useConversationStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const prevMessageCountRef = useRef(messages.length);

  const conversationId = currentConversation?._id || "";
  const currentUnreadCount = unreadCount[conversationId] || 0;

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
    if (!scrollArea || !conversationId) return;

    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const atBottom = distanceFromBottom < 150;

        setIsAtBottom(atBottom);

        // Mark as read when at bottom and has unread messages
        if (atBottom && currentUnreadCount > 0) {
          console.log(
            "🔵 Marking as read - scroll at bottom, unreadCount:",
            currentUnreadCount
          );
          _updateConversation(conversationId, { unreadCount: 0 });
          // conversationService.resetUnreadCount({
          //   conversationId: conversationId,
          // });
        }
      }, 50);
    };

    scrollArea.addEventListener("scroll", handleScroll);

    // Check immediately on mount or when unreadCount changes
    handleScroll();

    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [currentUnreadCount, conversationId, _updateConversation]);

  // Scroll to bottom when needed
  useLayoutEffect(() => {
    if (!isAtBottom || loading || messages.length === 0) return;
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
  }, [messages.length, isAtBottom, loading]);

  // Typing users for this conversation
  const typingUsersInConversation = conversationId
    ? typingUsers[conversationId]?.slice(0, 3) || []
    : [];

  const handleEdit = (messageId: string) => {
    const message = messages.find((m) => m._id === messageId);
    if (message && onEdit) {
      onEdit(messageId, message.content);
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      if (onDelete) {
        onDelete(messageToDelete);
      } else {
        deleteMessage(messageToDelete);
      }
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const scrollToBottom = () => {
    const el = scrollAreaRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      setHasNewMessages(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={scrollAreaRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {messages.length === 0 && !loading ? (
            <Box sx={{ textAlign: "center", py: 12, color: "text.secondary" }}>
              <Typography variant="body1" gutterBottom>
                Chưa có tin nhắn nào
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message) => (
                <MessageItemMui
                  key={message._id}
                  message={message}
                  isOwn={message.senderId._id === user?._id}
                  senderName={
                    message.senderId._id === user?._id
                      ? user.displayName
                      : message.senderId.displayName ||
                        message.senderId.username
                  }
                  senderAvatar={
                    message.senderId._id === user?._id
                      ? user?.avatarUrl
                      : message.senderId.avatarUrl
                  }
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}

              {typingUsersInConversation.length > 0 &&
                typingUsersInConversation.map((_u, index) => {
                  const otherUser = currentConversation?.participants.find(
                    (p) => p._id !== user?._id
                  );
                  return (
                    <TypingIndicator
                      key={index}
                      userInitial={otherUser?.displayName?.charAt(0) || "U"}
                      userAvatar={otherUser?.avatarUrl}
                    />
                  );
                })}
            </>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* New messages button */}
      {!isAtBottom && hasNewMessages && (
        <Box
          sx={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={scrollToBottom}
            startIcon={
              currentUnreadCount > 0 ? undefined : <KeyboardArrowDown />
            }
            sx={{
              borderRadius: "24px",
              textTransform: "none",
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            {currentUnreadCount > 0 && (
              <Box
                component="span"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  mr: 1,
                }}
              >
                {currentUnreadCount}
              </Box>
            )}
            Tin nhắn mới
            {currentUnreadCount === 0 && <KeyboardArrowDown sx={{ ml: 0.5 }} />}
          </Button>
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xóa tin nhắn</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(MessageListMui);
