/**
 * Conversation Service - Socket.IO operations for conversations
 * Handles real-time conversation management with backend
 */

import { socketService } from './socketService';
import type {
  GetOrCreateConversationPayload,
  ConversationCreatedResponse,
  ConversationsListResponse,
  GetConversationDetailPayload,
  ConversationDetailResponse,
  SearchConversationsPayload,
  SearchConversationsResultResponse,
  DeleteConversationPayload,
  DeleteConversationSuccessResponse,
  TotalUnreadCountResponse,
  ResetUnreadCountPayload,
  ResetUnreadCountSuccessResponse,
  ConversationErrorResponse,
  SocketEventCallback,
  ConversationUpdatedResponse
} from '@/types/message';

class ConversationService {
  // ==================== UTILITY METHODS ====================

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return socketService.isConnected();
  }

  // ==================== EMIT METHODS (Client → Server) ====================

  /**
   * Tạo hoặc lấy conversation với user khác
   */
  getOrCreateConversation(payload: GetOrCreateConversationPayload): void {
    if (socketService.isConnected()) {
      socketService.emit('GET_OR_CREATE_CONVERSATION', payload);
      console.log('📤 Tạo/lấy conversation với user:', payload.otherUserId);
    } else {
      console.warn('⚠️ Socket chưa kết nối, không thể tạo conversation');
    }
  }

  /**
   * Lấy danh sách conversations
   */
  getConversations(): void {
    if (socketService.isConnected()) {
      socketService.emit('GET_CONVERSATIONS');
      console.log('📤 Đang lấy danh sách conversations');
    } else {
      console.warn('⚠️ Socket chưa kết nối, không thể lấy conversations');
    }
  }

  /**
   * Lấy chi tiết conversation
   */
  getConversationDetail(payload: GetConversationDetailPayload): void {
    if (socketService.isConnected()) {
      socketService.emit('GET_CONVERSATION_DETAIL', payload);
      console.log('📤 Lấy chi tiết conversation:', payload.conversationId);
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  /**
   * Tìm kiếm conversations
   */
  searchConversations(payload: SearchConversationsPayload): void {
    if (socketService.isConnected()) {
      socketService.emit('SEARCH_CONVERSATIONS', payload);
      console.log('📤 Tìm kiếm conversations:', payload.query);
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  /**
   * Xóa conversation
   */
  deleteConversation(payload: DeleteConversationPayload): void {
    if (socketService.isConnected()) {
      socketService.emit('DELETE_CONVERSATION', payload);
      console.log('📤 Xóa conversation:', payload.conversationId);
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  /**
   * Lấy tổng số tin nhắn chưa đọc
   */
  getTotalUnreadCount(): void {
    if (socketService.isConnected()) {
      socketService.emit('GET_TOTAL_UNREAD_COUNT');
      console.log('📤 Lấy tổng unread count');
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  /**
   * Reset unread count
   */
  resetUnreadCount(payload: ResetUnreadCountPayload): void {
    if (socketService.isConnected()) {
      socketService.emit('RESET_UNREAD_COUNT', payload);
      console.log('📤 Reset unread count:', payload.conversationId);
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  // ==================== LISTENER METHODS (Server → Client) ====================

  /**
   * Listen for conversation created/retrieved
   */
  onConversationCreated(callback: SocketEventCallback<ConversationCreatedResponse>): void {
    socketService.on('CONVERSATION_CREATED', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversations list
   */
  onConversationsList(callback: SocketEventCallback<ConversationsListResponse>): void {
    socketService.on('CONVERSATIONS_LIST', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation detail
   */
  onConversationDetail(callback: SocketEventCallback<ConversationDetailResponse>): void {
    socketService.on('CONVERSATION_DETAIL', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for search results
   */
  onSearchConversationsResult(callback: SocketEventCallback<SearchConversationsResultResponse>): void {
    socketService.on('SEARCH_CONVERSATIONS_RESULT', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for delete conversation success
   */
  onDeleteConversationSuccess(callback: SocketEventCallback<DeleteConversationSuccessResponse>): void {
    socketService.on('DELETE_CONVERSATION_SUCCESS', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for total unread count
   */
  onTotalUnreadCount(callback: SocketEventCallback<TotalUnreadCountResponse>): void {
    socketService.on('TOTAL_UNREAD_COUNT', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for reset unread count success
   */
  onResetUnreadCountSuccess(callback: SocketEventCallback<ResetUnreadCountSuccessResponse>): void {
    socketService.on('RESET_UNREAD_COUNT_SUCCESS', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation updated (e.g., lastMessage changed)
   */
  onConversationUpdated(callback: SocketEventCallback<ConversationUpdatedResponse>): void {
    socketService.on('CONVERSATION_UPDATED', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation error
   */
  onConversationError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('CONVERSATION_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversations error
   */
  onConversationsError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('CONVERSATIONS_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation detail error
   */
  onConversationDetailError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('CONVERSATION_DETAIL_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for search error
   */
  onSearchConversationsError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('SEARCH_CONVERSATIONS_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for delete conversation error
   */
  onDeleteConversationError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('DELETE_CONVERSATION_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for total unread count error
   */
  onTotalUnreadCountError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('TOTAL_UNREAD_COUNT_ERROR', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for reset unread count error
   */
  onResetUnreadCountError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('RESET_UNREAD_COUNT_ERROR', callback as (...args: unknown[]) => void);
  }

  // ==================== CLEANUP METHODS ====================

  /**
   * Remove all conversation listeners
   */
  removeAllListeners(): void {
    socketService.removeListener('CONVERSATION_CREATED');
    socketService.removeListener('CONVERSATIONS_LIST');
    socketService.removeListener('CONVERSATION_DETAIL');
    socketService.removeListener('SEARCH_CONVERSATIONS_RESULT');
    socketService.removeListener('DELETE_CONVERSATION_SUCCESS');
    socketService.removeListener('TOTAL_UNREAD_COUNT');
    socketService.removeListener('RESET_UNREAD_COUNT_SUCCESS');
    socketService.removeListener('CONVERSATION_UPDATED');
    socketService.removeListener('CONVERSATION_ERROR');
    socketService.removeListener('CONVERSATIONS_ERROR');
    socketService.removeListener('CONVERSATION_DETAIL_ERROR');
    socketService.removeListener('SEARCH_CONVERSATIONS_ERROR');
    socketService.removeListener('DELETE_CONVERSATION_ERROR');
    socketService.removeListener('TOTAL_UNREAD_COUNT_ERROR');
    socketService.removeListener('RESET_UNREAD_COUNT_ERROR');
    console.log('🧹 Đã xóa tất cả conversation listeners');
  }

  /**
   * Remove specific listener
   */
  removeListener(event: string, callback?: SocketEventCallback): void {
    socketService.removeListener(event, callback);
  }
}

// Export singleton instance
export const conversationService = new ConversationService();
export default conversationService;
