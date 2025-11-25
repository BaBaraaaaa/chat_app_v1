/**
 * Message API Service - REST API operations for messages
 * Handles CRUD operations with backend via HTTP requests and Socket.IO
 */

import api from "@/lib/axios";
import { socketService } from "./socketService";
import type {
  Message,
  MessageType,
  SendMessagePayload,
  MessageSentResponse,
  MessagesListResponse,
  MarkMessageReadPayload,
  MarkReadSuccessResponse,
  MarkAllReadPayload,
  MarkAllReadSuccessResponse,
  DeleteMessagePayload,
  DeleteMessageSuccessResponse,
  EditMessagePayload,
  EditMessageSuccessResponse,
  TypingPayload,
  GetUnreadCountPayload,
  UnreadCountResponse,
  JoinConversationPayload,
  LeaveConversationPayload,
  MessageErrorResponse
} from "@/types/message";

// ==================== REST API RESPONSE TYPES ====================

interface MessageResponse {
  success: boolean;
  message: string;
  data?: Message;
  error?: unknown;
}

interface MessagesResponse {
  success: boolean;
  message: string;
  data?: {
    messages: Message[];
    total: number;
    hasMore: boolean;
  };
  error?: unknown;
}

interface UnreadResponse {
  success: boolean;
  message: string;
  data?: { count: number };
  error?: unknown;
}

interface SimpleResponse {
  success: boolean;
  message: string;
  error?: unknown;
}

// ==================== MESSAGE API SERVICE ====================

export const messageApiService = {

  // ==================== REST API OPERATIONS ====================

  /**
   * Lấy danh sách tin nhắn (REST API fallback)
   * Backend endpoint: GET /api/messages/:conversationId
   * Note: Thường dùng Socket.IO, REST API chỉ dùng khi cần fallback
   */
  getMessages: async (
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<MessagesResponse> => {
    const res = await api.get(
      `/messages/${conversationId}?limit=${limit}&skip=${skip}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Đánh dấu tin nhắn đã đọc (REST API fallback)
   * Backend endpoint: POST /api/messages/:messageId/read
   */
  markMessageAsRead: async (messageId: string): Promise<MessageResponse> => {
    const res = await api.post(
      `/messages/${messageId}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Đánh dấu tất cả tin nhắn đã đọc (REST API fallback)
   * Backend endpoint: POST /api/messages/conversations/:conversationId/mark-all-read
   */
  markAllMessagesAsRead: async (conversationId: string): Promise<SimpleResponse> => {
    const res = await api.post(
      `/messages/conversations/${conversationId}/mark-all-read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Xóa tin nhắn (REST API fallback)
   * Backend endpoint: DELETE /api/messages/:messageId
   */
  deleteMessage: async (messageId: string): Promise<MessageResponse> => {
    const res = await api.delete(
      `/messages/${messageId}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Chỉnh sửa tin nhắn (REST API fallback)
   * Backend endpoint: PUT /api/messages/:messageId
   */
  editMessage: async (messageId: string, newContent: string): Promise<MessageResponse> => {
    const res = await api.put(
      `/messages/${messageId}`,
      { content: newContent },
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Lấy số lượng tin nhắn chưa đọc (REST API fallback)
   * Backend endpoint: GET /api/messages/unread-count?conversationId=xxx
   */
  getUnreadCount: async (conversationId?: string): Promise<UnreadResponse> => {
    const url = conversationId
      ? `/messages/unread-count?conversationId=${conversationId}`
      : `/messages/unread-count`;
    
    const res = await api.get(url, { withCredentials: true });
    return res.data;
  },

  // ==================== SOCKET.IO OPERATIONS (PRIMARY) ====================

  /**
   * Gửi tin nhắn qua Socket.IO (Primary method)
   * Socket event: SEND_MESSAGE
   * Response events: MESSAGE_SENT | MESSAGE_ERROR
   */
  sendMessage: (payload: SendMessagePayload): Promise<MessageSentResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      // Set up response listeners
      const handleSuccess = (response: MessageSentResponse) => {
        socketService.off("MESSAGE_SENT", handleSuccess);
        socketService.off("MESSAGE_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("MESSAGE_SENT", handleSuccess);
        socketService.off("MESSAGE_ERROR", handleError);
        reject(new Error(error.message || "Failed to send message"));
      };

      // Listen for responses
      socketService.on("MESSAGE_SENT", handleSuccess);
      socketService.on("MESSAGE_ERROR", handleError);

      // Send message
      socketService.emit("SEND_MESSAGE", payload);

      // Timeout after 30 seconds
      setTimeout(() => {
        socketService.off("MESSAGE_SENT", handleSuccess);
        socketService.off("MESSAGE_ERROR", handleError);
        reject(new Error("Message send timeout"));
      }, 30000);
    });
  },

  /**
   * Lấy danh sách tin nhắn qua Socket.IO (Primary method)
   * Socket event: GET_MESSAGES
   * Response events: MESSAGES_LIST | MESSAGES_ERROR
   */
  getMessagesViaSocket: (payload: {
    conversationId: string;
    limit?: number;
    skip?: number;
  }): Promise<MessagesListResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: MessagesListResponse) => {
        socketService.off("MESSAGES_LIST", handleSuccess);
        socketService.off("MESSAGES_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("MESSAGES_LIST", handleSuccess);
        socketService.off("MESSAGES_ERROR", handleError);
        reject(new Error(error.message || "Failed to get messages"));
      };

      socketService.on("MESSAGES_LIST", handleSuccess);
      socketService.on("MESSAGES_ERROR", handleError);
      socketService.emit("GET_MESSAGES", payload);

      // Timeout after 15 seconds
      setTimeout(() => {
        socketService.off("MESSAGES_LIST", handleSuccess);
        socketService.off("MESSAGES_ERROR", handleError);
        reject(new Error("Get messages timeout"));
      }, 15000);
    });
  },

  /**
   * Đánh dấu tin nhắn đã đọc qua Socket.IO (Primary method)
   * Socket event: MARK_MESSAGE_READ
   * Response events: MARK_READ_SUCCESS | MARK_READ_ERROR
   */
  markMessageAsReadViaSocket: (payload: MarkMessageReadPayload): Promise<MarkReadSuccessResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: MarkReadSuccessResponse) => {
        socketService.off("MARK_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_READ_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("MARK_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_READ_ERROR", handleError);
        reject(new Error(error.message || "Failed to mark message as read"));
      };

      socketService.on("MARK_READ_SUCCESS", handleSuccess);
      socketService.on("MARK_READ_ERROR", handleError);
      socketService.emit("MARK_MESSAGE_READ", payload);

      setTimeout(() => {
        socketService.off("MARK_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_READ_ERROR", handleError);
        reject(new Error("Mark read timeout"));
      }, 10000);
    });
  },

  /**
   * Đánh dấu tất cả tin nhắn đã đọc qua Socket.IO (Primary method)
   * Socket event: MARK_ALL_READ
   * Response events: MARK_ALL_READ_SUCCESS | MARK_ALL_READ_ERROR
   */
  markAllAsReadViaSocket: (payload: MarkAllReadPayload): Promise<MarkAllReadSuccessResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: MarkAllReadSuccessResponse) => {
        socketService.off("MARK_ALL_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_ALL_READ_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("MARK_ALL_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_ALL_READ_ERROR", handleError);
        reject(new Error(error.message || "Failed to mark all messages as read"));
      };

      socketService.on("MARK_ALL_READ_SUCCESS", handleSuccess);
      socketService.on("MARK_ALL_READ_ERROR", handleError);
      socketService.emit("MARK_ALL_READ", payload);

      setTimeout(() => {
        socketService.off("MARK_ALL_READ_SUCCESS", handleSuccess);
        socketService.off("MARK_ALL_READ_ERROR", handleError);
        reject(new Error("Mark all read timeout"));
      }, 10000);
    });
  },

  /**
   * Xóa tin nhắn qua Socket.IO (Primary method)
   * Socket event: DELETE_MESSAGE
   * Response events: DELETE_MESSAGE_SUCCESS | DELETE_MESSAGE_ERROR
   */
  deleteMessageViaSocket: (payload: DeleteMessagePayload): Promise<DeleteMessageSuccessResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: DeleteMessageSuccessResponse) => {
        socketService.off("DELETE_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("DELETE_MESSAGE_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("DELETE_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("DELETE_MESSAGE_ERROR", handleError);
        reject(new Error(error.message || "Failed to delete message"));
      };

      socketService.on("DELETE_MESSAGE_SUCCESS", handleSuccess);
      socketService.on("DELETE_MESSAGE_ERROR", handleError);
      socketService.emit("DELETE_MESSAGE", payload);

      setTimeout(() => {
        socketService.off("DELETE_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("DELETE_MESSAGE_ERROR", handleError);
        reject(new Error("Delete message timeout"));
      }, 10000);
    });
  },

  /**
   * Chỉnh sửa tin nhắn qua Socket.IO (Primary method)
   * Socket event: EDIT_MESSAGE
   * Response events: EDIT_MESSAGE_SUCCESS | EDIT_MESSAGE_ERROR
   */
  editMessageViaSocket: (payload: EditMessagePayload): Promise<EditMessageSuccessResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: EditMessageSuccessResponse) => {
        socketService.off("EDIT_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("EDIT_MESSAGE_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("EDIT_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("EDIT_MESSAGE_ERROR", handleError);
        reject(new Error(error.message || "Failed to edit message"));
      };

      socketService.on("EDIT_MESSAGE_SUCCESS", handleSuccess);
      socketService.on("EDIT_MESSAGE_ERROR", handleError);
      socketService.emit("EDIT_MESSAGE", payload);

      setTimeout(() => {
        socketService.off("EDIT_MESSAGE_SUCCESS", handleSuccess);
        socketService.off("EDIT_MESSAGE_ERROR", handleError);
        reject(new Error("Edit message timeout"));
      }, 10000);
    });
  },

  /**
   * Lấy số lượng tin nhắn chưa đọc qua Socket.IO (Primary method)
   * Socket event: GET_UNREAD_COUNT
   * Response events: UNREAD_COUNT | UNREAD_COUNT_ERROR
   */
  getUnreadCountViaSocket: (payload?: GetUnreadCountPayload): Promise<UnreadCountResponse> => {
    return new Promise((resolve, reject) => {
      if (!socketService.isConnected()) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleSuccess = (response: UnreadCountResponse) => {
        socketService.off("UNREAD_COUNT", handleSuccess);
        socketService.off("UNREAD_COUNT_ERROR", handleError);
        resolve(response);
      };

      const handleError = (error: MessageErrorResponse) => {
        socketService.off("UNREAD_COUNT", handleSuccess);
        socketService.off("UNREAD_COUNT_ERROR", handleError);
        reject(new Error(error.message || "Failed to get unread count"));
      };

      socketService.on("UNREAD_COUNT", handleSuccess);
      socketService.on("UNREAD_COUNT_ERROR", handleError);
      socketService.emit("GET_UNREAD_COUNT", payload);

      setTimeout(() => {
        socketService.off("UNREAD_COUNT", handleSuccess);
        socketService.off("UNREAD_COUNT_ERROR", handleError);
        reject(new Error("Get unread count timeout"));
      }, 10000);
    });
  },

  // ==================== REAL-TIME OPERATIONS ====================

  /**
   * Join conversation room để nhận real-time updates
   * Socket event: JOIN_CONVERSATION
   */
  joinConversation: (payload: JoinConversationPayload): void => {
    if (socketService.isConnected()) {
      socketService.emit("JOIN_CONVERSATION", payload);
    }
  },

  /**
   * Leave conversation room
   * Socket event: LEAVE_CONVERSATION
   */
  leaveConversation: (payload: LeaveConversationPayload): void => {
    if (socketService.isConnected()) {
      socketService.emit("LEAVE_CONVERSATION", payload);
    }
  },

  /**
   * Bắt đầu typing indicator
   * Socket event: TYPING_START
   */
  startTyping: (payload: TypingPayload): void => {
    if (socketService.isConnected()) {
      socketService.emit("TYPING_START", payload);
    }
  },

  /**
   * Dừng typing indicator
   * Socket event: TYPING_STOP
   */
  stopTyping: (payload: TypingPayload): void => {
    if (socketService.isConnected()) {
      socketService.emit("TYPING_STOP", payload);
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Kiểm tra connection status
   */
  isConnected: (): boolean => {
    return socketService.isConnected();
  },

  /**
   * Validate message content before sending
   */
  validateMessageContent: (content: string, type: MessageType = "text"): boolean => {
    if (!content || content.trim().length === 0) {
      return false;
    }

    if (type === "text") {
      // Maximum text message length
      if (content.length > 4000) {
        return false;
      }
    }

    return true;
  },

  /**
   * Format message for display
   */
  formatMessage: (message: Message): Message => {
    return {
      ...message,
      content: message.isDeleted ? "Tin nhắn đã bị xóa" : message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  },

  /**
   * Get message display time
   */
  getMessageDisplayTime: (message: Message): string => {
    const date = new Date(message.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
  }
};