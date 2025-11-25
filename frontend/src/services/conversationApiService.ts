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
    console.log("getConversation Details");
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
   * Xóa conversation
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
  }
};