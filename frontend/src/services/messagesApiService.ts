import api from "@/lib/axios";
import type {
  Message,
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
  }
};