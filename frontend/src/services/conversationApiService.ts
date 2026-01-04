/**
 * Conversation API Service - REST API operations for conversations
 * Handles CRUD operations with backend via HTTP requests
 */

import api from "@/lib/axios";
import type { Conversation } from "@/types/message";

interface ConversationResponse {
  success: boolean;
  message: string;
  data?: Conversation;
  error?: unknown;
}

interface ConversationsListResponse {
  success: boolean;
  message: string;
  data?: Conversation[];
  error?: unknown;
}

interface SearchConversationsResponse {
  success: boolean;
  message: string;
  data?: Conversation[];
  error?: unknown;
}

interface UnreadCountResponse {
  success: boolean;
  message: string;
  data?: number;
  error?: unknown;
}

interface SimpleResponse {
  success: boolean;
  message: string;
  error?: unknown;
}

export const conversationApiService = {

  // ==================== CRUD OPERATIONS ====================

  /**
   * Tạo hoặc lấy conversation với user khác
   * Backend endpoint: POST /api/conversations
   */
  getOrCreateConversation: async (otherUserId: string): Promise<ConversationResponse> => {
    const res = await api.post(
      "/conversations",
      { otherUserId },
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Tạo cuộc hội thoại nhóm
   * Backend endpoint: POST /api/conversations/group
   */
  createGroup: async (name: string, participantIds: string[], avatarUrl?: string): Promise<ConversationResponse> => {
    const res = await api.post(
      "/conversations/group",
      { name, participantIds, avatarUrl },
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Lấy danh sách conversations
   * Backend endpoint: GET /api/conversations
   */
  getConversations: async (): Promise<ConversationsListResponse> => {
    const res = await api.get(
      `/conversations`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Lấy chi tiết conversation
   * Backend endpoint: GET /api/conversations/:id
   */
  getConversationDetail: async (conversationId: string): Promise<ConversationResponse> => {
    const res = await api.get(
      `/conversations/${conversationId}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Tìm kiếm conversations
   * Backend endpoint: GET /api/conversations/search?q=query
   */
  searchConversations: async (query: string): Promise<SearchConversationsResponse> => {
    const res = await api.get(
      `/conversations/search?q=${encodeURIComponent(query)}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Xóa conversation [REST Fallback - Socket preferred]
   * Backend endpoint: DELETE /api/conversations/:id
   */
  deleteConversation: async (conversationId: string): Promise<SimpleResponse> => {
    const res = await api.delete(
      `/conversations/${conversationId}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Lấy tổng số tin nhắn chưa đọc
   * Backend endpoint: GET /api/conversations/unread-count
   */
  getTotalUnreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await api.get(
      "/conversations/unread-count",
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Reset unread count cho conversation
   * Backend endpoint: POST /api/conversations/:id/read
   */
  resetUnreadCount: async (conversationId: string): Promise<SimpleResponse> => {
    const res = await api.post(
      `/conversations/${conversationId}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Thêm thành viên vào nhóm
   * Backend endpoint: PUT /api/conversations/:id/participants
   */
  addParticipants: async (conversationId: string, participantIds: string[]): Promise<ConversationResponse> => {
    const res = await api.put(
      `/conversations/${conversationId}/participants`,
      { participantIds },
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Xóa thành viên khỏi nhóm
   * Backend endpoint: DELETE /api/conversations/:id/participants
   */
  removeParticipant: async (conversationId: string, participantId: string): Promise<ConversationResponse> => {
    const res = await api.delete(
      `/conversations/${conversationId}/participants`,
      {
        data: { participantId },
        withCredentials: true
      }
    );
    return res.data;
  },

  /**
   * Rời nhóm
   * Backend endpoint: POST /api/conversations/:id/leave
   */
  leaveGroup: async (conversationId: string): Promise<SimpleResponse> => {
    const res = await api.post(
      `/conversations/${conversationId}/leave`, {},
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Cập nhật avatar nhóm
   * Backend endpoint: POST /api/conversations/:id/avatar
   */
  updateGroupAvatar: async (conversationId: string, file: File): Promise<ConversationResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await api.post(
      `/conversations/${conversationId}/avatar`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return res.data;
  }
};