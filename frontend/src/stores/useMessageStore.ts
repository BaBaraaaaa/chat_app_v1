/**
 * Message Store - Zustand State Management
 * Manages message state and Socket.IO listeners
 */

import { create } from "zustand";
import { toast } from "sonner";
import { messageService } from "@/socket/messageService";
import { messageApiService } from "@/services/messagesApiService";
import { useConversationStore } from "./useConversationStore";
import { useAuthStore } from "./useAuthStore";
import type {
    Message,
    SendMessagePayload,
    UserTypingResponse,
    MessageNotificationData
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

    //Thêm cursor pagination
    cursor: Record<string, string | null>;

    // Actions
    sendMessage: (payload: SendMessagePayload) => void;

    getMessagesByCursor: (conversationId: string, limit?: number, cursor?: string) => void;
    markMessageAsRead: (messageId: string) => void;
    markAllAsRead: (conversationId: string) => void;
    deleteMessage: (messageId: string) => void;
    editMessage: (messageId: string, newContent: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    setCurrentConversation: (conversationId: string | null) => void;
    clearMessages: (conversationId: string) => void;
    clearChat: (conversationId: string) => Promise<void>;

    // Socket listeners
    setupSocketListeners: () => void;
    removeSocketListeners: () => void;

    // Internal state setters
    _addMessage: (conversationId: string, message: Message) => void;
    _setMessages: (
        conversationId: string,
        messages: Message[],
        total: number,
        hasMore: boolean,
        isPagination?: boolean,
        nextCursor?: string
    ) => void;
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
    cursor: {},
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
     * 
     * Lấy danh sách tin nhắn áp dụng cursor Pagination
     */
    getMessagesByCursor: async (conversationId: string, limit = 50, cursor?: string) => {
        try {
            set({ loading: true });
            const response = await messageApiService.getMessagesByCursor(conversationId, limit, cursor);

            if (response.success && response.data) {
                // Filter out deleted messages
                const activeMessages = response.data.messages.filter(msg => !msg.isDeleted);

                const isPagination = !!cursor; // If cursor exists, it's a pagination request

                get()._setMessages(
                    conversationId,
                    activeMessages,
                    response.data.total,
                    response.data.hasMore,
                    isPagination,
                    response.data.nextCursor
                );
            } else {
                toast.error("Không thể tải tin nhắn");
            }
        } catch (error) {
            console.error("Failed to load messages via cursor:", error);
            toast.error("Lỗi khi tải tin nhắn");
        } finally {
            set({ loading: false });
        }
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
    startTyping: (conversationId: string) => {
        messageService.startTyping({ conversationId });
    },

    /**
     * Dừng typing
     */
    stopTyping: (conversationId: string) => {
        messageService.stopTyping({ conversationId });
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
     * Clear messages for conversation (Local only)
     */
    clearMessages: (conversationId: string) => {
        set(state => {
            const newMessages = { ...state.messages };
            delete newMessages[conversationId];
            return { messages: newMessages };
        });
    },

    /**
     * Clear chat history (Backend + Local)
     */
    clearChat: async (conversationId: string) => {
        try {
            set({ loading: true });
            const response = await messageApiService.clearChat(conversationId);
            if (response.success) {
                // Clear local messages
                get().clearMessages(conversationId);

                // Reset cursor
                set(state => ({
                    cursor: { ...state.cursor, [conversationId]: null },
                    hasMore: { ...state.hasMore, [conversationId]: false }
                }));

                // Update lastMessage in conversation sidebar
                useConversationStore.getState()._updateConversation(conversationId, {
                    lastMessage: undefined
                });

                toast.success("Đã xóa lịch sử trò chuyện");
            } else {
                toast.error(response.message || "Không thể xóa lịch sử trò chuyện");
            }
        } catch (error) {
            console.error("Failed to clear chat:", error);
            toast.error("Lỗi khi xóa lịch sử trò chuyện");
        } finally {
            set({ loading: false });
        }
    },

    // ==================== SOCKET LISTENERS ====================

    /**
     * Setup Socket listeners
     */
    setupSocketListeners: () => {
        if (get()._listenersSetup) {
            return;
        }
        // Listen for new message (real-time trong conversation room)
        messageService.onNewMessage((data) => {
            get()._addMessage(data.conversationId, data.message);

            // ✅ Cập nhật sidebar conversation's lastMessage và unreadCount
            try {
                const conversationStore = useConversationStore.getState();
                const currentUser = useAuthStore.getState().user;
                const currentUserId = currentUser?._id;
                const currentConversation = conversationStore.currentConversation;

                const conversation = conversationStore.conversations.find(c => c._id === data.conversationId);

                // ✅ Nếu conversation chưa có trong list (conversation mới tạo chưa có message)
                // → Fetch lại conversations để lấy conversation này
                if (!conversation) {
                    conversationStore.getConversations();
                    return;
                }

                const isFromOtherUser = data.message.senderId._id !== currentUserId;
                const isViewingConversation = currentConversation?._id === data.conversationId;

                const updates: Partial<typeof conversation> = {
                    lastMessage: {
                        content: data.message.content,
                        senderId: data.message.senderId,
                        sentAt: data.message.createdAt,
                        type: data.message.type
                    },
                    updatedAt: data.message.createdAt
                };

                // ✅ Xử lý unreadCount:
                // - Nếu KHÔNG đang xem conversation VÀ tin nhắn từ người khác → tăng unreadCount
                // - Nếu ĐANG xem conversation VÀ tin nhắn từ người khác → backend đã tăng, frontend LOAD LẠI từ backend
                if (isFromOtherUser && !isViewingConversation) {
                    const currentUnreadCount = conversation?.unreadCount || 0;
                    updates.unreadCount = currentUnreadCount + 1;
                } else if (isFromOtherUser && isViewingConversation) {
                    // Backend đã tăng unreadCount, frontend cần giữ nguyên giá trị CŨ + 1
                    // hoặc fetch lại từ backend. Ở đây ta tăng 1 để sync với backend
                    const currentUnreadCount = conversation?.unreadCount || 0;
                    updates.unreadCount = currentUnreadCount + 1;
                }

                conversationStore._updateConversation(data.conversationId, updates);

                const updatedConversations = useConversationStore.getState().conversations;

                const sorted = [...updatedConversations].sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

                conversationStore._setConversations(sorted);
            } catch (error) {
                console.error("❌ Lỗi khi cập nhật sidebar:", error);
            }
        });

        // Listen for messages list
        // Listen for messages list - REMOVED (Moved to REST API)
        // messageService.onMessagesList((data) => { ... });

        // Listen for message read
        messageService.onMessageRead((data) => {
            get()._updateMessage(data.messageId, {
                status: "read",
                readAt: data.readAt
            });
        });

        // Listen for mark all read success
        messageService.onMarkAllReadSuccess((data) => {
            if (data.success) {
                toast.success("Đã đọc tất cả tin nhắn");
            }
        });

        // Listen for message deleted
        messageService.onMessageDeleted((data) => {
            get()._removeMessage(data.messageId);
        });

        // Listen for delete success
        messageService.onDeleteMessageSuccess((data) => {
            if (data.success) {
                toast.success("Đã xóa tin nhắn");
            }
        });

        // Listen for message edited
        messageService.onMessageEdited((data) => {
            get()._updateMessage(data.messageId, {
                content: data.newContent,
                isEdited: true
            });
        });

        // Listen for edit success
        // messageService.onEditMessageSuccess((data) => {
        //     if (data.success) {
        //         toast.success("Đã chỉnh sửa tin nhắn");
        //     }
        // });

        // Listen for typing indicator
        messageService.onUserTyping((data) => {
            get()._updateTypingUsers(data);
        });

        // Listen for global message notifications (không cần join room)
        messageService.onMessageNotification((data: MessageNotificationData) => {
            const { message, conversation, unreadCount } = data;
            const conversationId = conversation._id;
            const currentUser = useAuthStore.getState().user;

            // Bỏ qua notification từ chính mình
            if (message.senderId._id === currentUser?._id) {
                return;
            }

            // Update conversation với thông tin mới
            const conversationStore = useConversationStore.getState();
            const existingConversation = conversationStore.conversations.find(c => c._id === conversationId);

            if (!existingConversation) {
                conversationStore.getConversations();
                return;
            }

            conversationStore._updateConversation(conversationId, {
                lastMessage: {
                    content: message.content,
                    senderId: message.senderId,
                    sentAt: message.createdAt,
                    type: message.type
                },
                unreadCount: unreadCount,
                isActive: true
            });
        });

        // Listen for errors
        messageService.onMessageError((data) => {
            toast.error(data.message);
        });

        messageService.onMessagesError((data) => {
            toast.error(data.message);
            set({ loading: false });
        });

        set({ _listenersSetup: true });
    },

    /**
     * Remove Socket listeners
     */
    removeSocketListeners: () => {
        messageService.removeAllListeners();
        set({ _listenersSetup: false });
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
    _setMessages: (
        conversationId: string,
        messages: Message[],
        _total: number,
        hasMore: boolean,
        isPagination = false,
        nextCursor?: string
    ) => {
        set(state => {
            const currentMessages = state.messages[conversationId] || [];
            // Backend sends Newest -> Oldest (Descending)
            // Frontend stores Oldest -> Newest (Ascending)
            const inboundMessages = messages.reverse();

            let newMessages: Message[];
            if (isPagination) {
                // Prepend older messages
                newMessages = [...inboundMessages, ...currentMessages];
            } else {
                // Initial load: Replace
                newMessages = inboundMessages;
            }

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: newMessages
                },
                hasMore: {
                    ...state.hasMore,
                    [conversationId]: hasMore
                },
                cursor: {
                    ...state.cursor,
                    [conversationId]: nextCursor || null
                }
            };
        });
        console.log("Updated cursor for", conversationId, ":", nextCursor);
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
            let deletedFromConversationId: string | null = null;

            for (const conversationId in newMessages) {
                const originalLength = newMessages[conversationId].length;
                newMessages[conversationId] = newMessages[conversationId].filter(
                    m => m._id !== messageId
                );

                // Track which conversation this message was deleted from
                if (newMessages[conversationId].length !== originalLength) {
                    deletedFromConversationId = conversationId;
                }
            }

            // Update lastMessage in conversation if needed
            if (deletedFromConversationId) {
                const remainingMessages = newMessages[deletedFromConversationId];
                const conversationStore = useConversationStore.getState();

                if (remainingMessages.length === 0) {
                    // No messages left - set lastMessage to undefined
                    conversationStore._updateConversation(deletedFromConversationId, {
                        lastMessage: undefined
                    });
                } else {
                    // Get the last remaining message
                    const lastMessage = remainingMessages[remainingMessages.length - 1];
                    conversationStore._updateConversation(deletedFromConversationId, {
                        lastMessage: {
                            content: lastMessage.content,
                            senderId: lastMessage.senderId,
                            sentAt: lastMessage.createdAt,
                            type: lastMessage.type || 'text',
                        }
                    });
                }
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

