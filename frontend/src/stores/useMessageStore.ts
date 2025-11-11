/**
 * Message Store - Zustand State Management
 * Manages message state and Socket.IO listeners
 */

import { create } from "zustand";
import { toast } from "sonner";
import { messageService } from "@/services/messageService";
import { useConversationStore } from "./useConversationStore";
import { useAuthStore } from "./useAuthStore";
import type {
    Message,
    SendMessagePayload,
    UserTypingResponse
} from "@/types/message";

interface MessageState {
    // State
    messages: Record<string, Message[]>; // conversationId -> messages[]
    currentConversationId: string | null;
    loading: boolean;
    hasMore: Record<string, boolean>; // conversationId -> hasMore
    typingUsers: Record<string, string[]>; // conversationId -> userId[]
    unreadCount: Record<string, number>; // conversationId -> count
    _listenersSetup: boolean;

    // Actions
    sendMessage: (payload: SendMessagePayload) => void;
    getMessages: (conversationId: string, limit?: number, skip?: number) => void;
    markMessageAsRead: (messageId: string) => void;
    markAllAsRead: (conversationId: string) => void;
    deleteMessage: (messageId: string) => void;
    editMessage: (messageId: string, newContent: string) => void;
    startTyping: (conversationId: string, receiverId: string) => void;
    stopTyping: (conversationId: string, receiverId: string) => void;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    setCurrentConversation: (conversationId: string | null) => void;
    clearMessages: (conversationId: string) => void;

    // Socket listeners
    setupSocketListeners: () => void;
    removeSocketListeners: () => void;

    // Internal state setters
    _addMessage: (conversationId: string, message: Message) => void;
    _setMessages: (conversationId: string, messages: Message[], total: number, hasMore: boolean) => void;
    _updateMessage: (messageId: string, updates: Partial<Message>) => void;
    _removeMessage: (messageId: string) => void;
    _updateTypingUsers: (data: UserTypingResponse) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    // ==================== STATE ====================
    messages: {},
    currentConversationId: null,
    loading: false,
    hasMore: {},
    typingUsers: {},
    unreadCount: {},
    _listenersSetup: false,

    // ==================== ACTIONS ====================

    /**
     * Gửi tin nhắn
     */
    sendMessage: (payload: SendMessagePayload) => {
        if (!messageService.isConnected()) {
            toast.error("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.");
            return;
        }
        messageService.sendMessage(payload);
    },

    /**
     * Lấy danh sách tin nhắn
     */
    getMessages: (conversationId: string, limit = 50, skip = 0) => {
        if (!messageService.isConnected()) {
            console.warn("⚠️ Socket chưa kết nối, đợi kết nối để lấy tin nhắn");
            return;
        }

        set({ loading: true });
        messageService.getMessages({ conversationId, limit, skip });
    },

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    markMessageAsRead: (messageId: string) => {
        messageService.markMessageAsRead({ messageId });
        // Optimistic update
        get()._updateMessage(messageId, { status: "read", readAt: new Date().toISOString() });
    },

    /**
     * Đánh dấu tất cả tin nhắn đã đọc
     */
    markAllAsRead: (conversationId: string) => {
        messageService.markAllAsRead({ conversationId });
        // Optimistic update - đánh dấu tất cả messages trong conversation
        const messages = get().messages[conversationId] || [];
        const updatedMessages = messages.map(m => ({
            ...m,
            status: "read" as const,
            readAt: new Date().toISOString()
        }));
        set(state => ({
            messages: {
                ...state.messages,
                [conversationId]: updatedMessages
            },
            unreadCount: {
                ...state.unreadCount,
                [conversationId]: 0
            }
        }));
    },

    /**
     * Xóa tin nhắn
     */
    deleteMessage: (messageId: string) => {
        messageService.deleteMessage({ messageId });
        // Optimistic update
        get()._removeMessage(messageId);
    },

    /**
     * Chỉnh sửa tin nhắn
     */
    editMessage: (messageId: string, newContent: string) => {
        messageService.editMessage({ messageId, newContent });
        // Optimistic update
        get()._updateMessage(messageId, { content: newContent, isEdited: true });
    },

    /**
     * Bắt đầu typing
     */
    startTyping: (conversationId: string, receiverId: string) => {
        messageService.startTyping({ conversationId, receiverId });
    },

    /**
     * Dừng typing
     */
    stopTyping: (conversationId: string, receiverId: string) => {
        messageService.stopTyping({ conversationId, receiverId });
    },

    /**
     * Join conversation room
     */
    joinConversation: (conversationId: string) => {
        messageService.joinConversation({ conversationId });
    },

    /**
     * Leave conversation room
     */
    leaveConversation: (conversationId: string) => {
        messageService.leaveConversation({ conversationId });
    },

    /**
     * Set current conversation
     */
    setCurrentConversation: (conversationId: string | null) => {
        set({ currentConversationId: conversationId });
    },

    /**
     * Clear messages for conversation
     */
    clearMessages: (conversationId: string) => {
        set(state => {
            const newMessages = { ...state.messages };
            delete newMessages[conversationId];
            return { messages: newMessages };
        });
    },

    // ==================== SOCKET LISTENERS ====================

    /**
     * Setup Socket listeners
     */
    setupSocketListeners: () => {
        console.log("🔧 Đang gọi setupMessageListeners - _listenersSetup:", get()._listenersSetup);
        
        if (get()._listenersSetup) {
            console.log("⚠️ Listeners đã được thiết lập rồi, bỏ qua...");
            return;
        }

        get().removeSocketListeners();

        console.log("🔧 Đang thiết lập các listener cho tin nhắn...");

        // Listen for message sent success
        messageService.onMessageSent((data) => {
            console.log("✅ Đã gửi tin nhắn thành công:", data);
        });

        // Listen for new message (real-time)
        console.log("🎧 Đang register listener NEW_MESSAGE...");
        messageService.onNewMessage((data) => {
            console.log("📩 ============ NEW_MESSAGE EVENT TRIGGERED ============");
            console.log("📩 Nhận được tin nhắn mới:", data);
            
            get()._addMessage(data.conversationId, data.message);
            
            console.log("📨 Sau khi thêm tin nhắn - trạng thái messages:", get().messages);

            // ✅ Cập nhật sidebar conversation's lastMessage và unreadCount
            try {
                const conversationStore = useConversationStore.getState();
                const currentUser = useAuthStore.getState().user;
                const currentUserId = currentUser?._id;
                const currentConversation = conversationStore.currentConversation;
                
                console.log("📋 Danh sách cuộc trò chuyện hiện tại:", conversationStore.conversations);
                console.log("📋 Đang cố cập nhật cuộc trò chuyện:", data.conversationId);
                console.log("👤 ID người dùng hiện tại:", currentUserId);
                console.log("👤 ID người gửi tin nhắn:", data.message.senderId);
                console.log("💬 Cuộc trò chuyện đang xem:", currentConversation?._id);
                
                const conversation = conversationStore.conversations.find(c => c._id === data.conversationId);
                
                const isFromOtherUser = data.message.senderId._id !== currentUserId;
                const isNotViewingConversation = currentConversation?._id !== data.conversationId;
                const shouldIncreaseUnread = isFromOtherUser && isNotViewingConversation;
                
                const currentUnreadCount = conversation?.unreadCount || 0;
                const newUnreadCount = shouldIncreaseUnread ? currentUnreadCount + 1 : currentUnreadCount;
                
                console.log("📊 Tính toán số tin nhắn chưa đọc:", {
                    isFromOtherUser,
                    isNotViewingConversation,
                    shouldIncreaseUnread,
                    currentUnreadCount,
                    newUnreadCount
                });
                
                if (isFromOtherUser) {
                    console.log("🔔 Đây là tin nhắn từ NGƯỜI KHÁC - sidebar nên update!");
                } else {
                    console.log("👤 Đây là tin nhắn của CHÍNH BẠN - không tăng unread");
                }
                
                conversationStore._updateConversation(data.conversationId, {
                    lastMessage: {
                        content: data.message.content,
                        senderId: data.message.senderId,
                        sentAt: data.message.createdAt,
                        type: data.message.type
                    },
                    updatedAt: data.message.createdAt,
                    unreadCount: newUnreadCount
                });

                const updatedConversations = useConversationStore.getState().conversations;
                console.log("📋 Danh sách cuộc trò chuyện sau khi cập nhật:", updatedConversations);

                const sorted = [...updatedConversations].sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
                
                console.log("📋 Danh sách cuộc trò chuyện đã sắp xếp:", sorted);
                conversationStore._setConversations(sorted);
                
                console.log("✅ Đã cập nhật sidebar với tin nhắn mới");
            } catch (error) {
                console.error("❌ Lỗi khi cập nhật sidebar:", error);
            }
        });

        // Listen for messages list
        messageService.onMessagesList((data) => {
            console.log("📬 Nhận được danh sách tin nhắn:", data);
            if (data.success && data.data) {
                const conversationId = data.data.messages[0]?.conversationId;
                if (conversationId) {
                    get()._setMessages(
                        conversationId,
                        data.data.messages,
                        data.data.total,
                        data.data.hasMore
                    );
                }
                set({ loading: false });
            } else {
                set({ loading: false });
                toast.error("Không thể tải tin nhắn");
            }
        });

        // Listen for message read
        messageService.onMessageRead((data) => {
            console.log("👁️ Tin nhắn đã được đọc:", data);
            get()._updateMessage(data.messageId, {
                status: "read",
                readAt: data.readAt
            });
        });

        // Listen for mark all read success
        messageService.onMarkAllReadSuccess((data) => {
            console.log("✅ Đã đánh dấu tất cả tin nhắn là đã đọc:", data);
            if (data.success) {
                toast.success("Đã đọc tất cả tin nhắn");
            }
        });

        // Listen for message deleted
        messageService.onMessageDeleted((data) => {
            console.log("🗑️ Tin nhắn đã bị xóa:", data);
            get()._removeMessage(data.messageId);
        });

        // Listen for delete success
        messageService.onDeleteMessageSuccess((data) => {
            console.log("✅ Xóa tin nhắn thành công:", data);
            if (data.success) {
                toast.success("Đã xóa tin nhắn");
            }
        });

        // Listen for message edited
        messageService.onMessageEdited((data) => {
            console.log("✏️ Tin nhắn đã được chỉnh sửa:", data);
            get()._updateMessage(data.messageId, {
                content: data.newContent,
                isEdited: true
            });
        });

        // Listen for edit success
        messageService.onEditMessageSuccess((data) => {
            console.log("✅ Chỉnh sửa tin nhắn thành công:", data);
            if (data.success) {
                toast.success("Đã chỉnh sửa tin nhắn");
            }
        });

        // Listen for typing indicator
        messageService.onUserTyping((data) => {
            get()._updateTypingUsers(data);
        });

        // Listen for errors
        messageService.onMessageError((data) => {
            console.error("❌ Lỗi tin nhắn:", data);
            toast.error(data.message);
        });

        messageService.onMessagesError((data) => {
            console.error("❌ Lỗi khi lấy danh sách tin nhắn:", data);
            toast.error(data.message);
            set({ loading: false });
        });

        console.log("✅ Đã thiết lập xong tất cả các listener cho tin nhắn");
        set({ _listenersSetup: true });
    },

    /**
     * Remove Socket listeners
     */
    removeSocketListeners: () => {
        console.log("🧹 Đang xóa các listener cho tin nhắn...");
        messageService.removeAllListeners();
        set({ _listenersSetup: false });
        console.log("✅ Đã xóa xong các listener cho tin nhắn");
    },

    // ==================== INTERNAL STATE SETTERS ====================

    /**
     * Add message to conversation
     */
    _addMessage: (conversationId: string, message: Message) => {
        set(state => {
            const existingMessages = state.messages[conversationId] || [];
            // Kiểm tra message đã tồn tại chưa (tránh duplicate)
            if (existingMessages.some(m => m._id === message._id)) {
                return state;
            }
            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...existingMessages, message]
                }
            };
        });
    },

    /**
     * Set messages for conversation
     */
    _setMessages: (conversationId: string, messages: Message[], _total: number, hasMore: boolean) => {
        set(state => ({
            messages: {
                ...state.messages,
                [conversationId]: messages.reverse()
            },
            hasMore: {
                ...state.hasMore,
                [conversationId]: hasMore
            }
        }));
    },

    /**
     * Update message
     */
    _updateMessage: (messageId: string, updates: Partial<Message>) => {
        set(state => {
            const newMessages = { ...state.messages };
            for (const conversationId in newMessages) {
                const messages = newMessages[conversationId];
                const index = messages.findIndex(m => m._id === messageId);
                if (index !== -1) {
                    newMessages[conversationId] = [
                        ...messages.slice(0, index),
                        { ...messages[index], ...updates },
                        ...messages.slice(index + 1)
                    ];
                    break;
                }
            }
            return { messages: newMessages };
        });
    },

    /**
     * Remove message
     */
    _removeMessage: (messageId: string) => {
        set(state => {
            const newMessages = { ...state.messages };
            for (const conversationId in newMessages) {
                newMessages[conversationId] = newMessages[conversationId].filter(
                    m => m._id !== messageId
                );
            }
            return { messages: newMessages };
        });
    },

    /**
     * Update typing users
     */
    _updateTypingUsers: (data: UserTypingResponse) => {
        set(state => {
            const currentTyping = state.typingUsers[data.conversationId] || [];
            let newTyping: string[];

            if (data.isTyping) {
                // Thêm user vào danh sách đang typing
                if (!currentTyping.includes(data.userId)) {
                    newTyping = [...currentTyping, data.userId];
                } else {
                    newTyping = currentTyping;
                }
            } else {
                // Xóa user khỏi danh sách đang typing
                newTyping = currentTyping.filter(id => id !== data.userId);
            }

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [data.conversationId]: newTyping
                }
            };
        });
    },
}));
