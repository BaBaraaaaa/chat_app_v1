/**
 * Conversation Socket Service - Real-time events only
 * Handles live conversation updates, typing indicators, notifications
 * 
 * NOTE: For data loading (CRUD operations), use conversationApiService.ts
 */

import { socketService } from './socketService';
import type {
  ConversationUpdatedResponse,
  ConversationErrorResponse,
  SocketEventCallback
} from '@/types/message';

class ConversationSocketService {
  // ==================== UTILITY METHODS ====================

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return socketService.isConnected();
  }

  // ==================== REAL-TIME EMIT METHODS ====================

  /**
   * Join conversation room for real-time updates
   */
  joinConversationRoom(conversationId: string): void {
    if (socketService.isConnected()) {
      socketService.emit('JOIN_CONVERSATION_ROOM', { conversationId });
      console.log('🏠 Joined conversation room:', conversationId);
    } else {
      console.warn('⚠️ Socket chưa kết nối, không thể join room');
    }
  }

  /**
   * Leave conversation room
   */
  leaveConversationRoom(conversationId: string): void {
    if (socketService.isConnected()) {
      socketService.emit('LEAVE_CONVERSATION_ROOM', { conversationId });
      console.log('� Left conversation room:', conversationId);
    } else {
      console.warn('⚠️ Socket chưa kết nối');
    }
  }

  /**
   * Send typing status (real-time)
   */
  sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (socketService.isConnected()) {
      socketService.emit('TYPING_STATUS', { conversationId, isTyping });
    }
  }

  /**
   * Mark conversation as read (real-time notification)
   */
  markAsReadRealtime(conversationId: string): void {
    if (socketService.isConnected()) {
      socketService.emit('MARK_CONVERSATION_READ', { conversationId });
      console.log('📖 Marked conversation as read (real-time):', conversationId);
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  /**
   * Listen for conversation updated (real-time)
   */
  onConversationUpdated(callback: SocketEventCallback<ConversationUpdatedResponse>): void {
    socketService.on('CONVERSATION_UPDATED', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for new conversation notification (real-time)
   */
  onNewConversationNotification(callback: SocketEventCallback<unknown>): void {
    socketService.on('NEW_CONVERSATION_NOTIFICATION', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation deleted (real-time)
   */
  onConversationDeleted(callback: SocketEventCallback<unknown>): void {
    socketService.on('CONVERSATION_DELETED_NOTIFICATION', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for user typing in conversation
   */
  onUserTyping(callback: SocketEventCallback<unknown>): void {
    socketService.on('USER_TYPING', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for user stopped typing
   */
  onUserStoppedTyping(callback: SocketEventCallback<unknown>): void {
    socketService.on('USER_STOPPED_TYPING', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for unread count changed (real-time)
   */
  onUnreadCountChanged(callback: SocketEventCallback<unknown>): void {
    socketService.on('UNREAD_COUNT_CHANGED', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation member joined
   */
  onMemberJoined(callback: SocketEventCallback<unknown>): void {
    socketService.on('MEMBER_JOINED_CONVERSATION', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation member left
   */
  onMemberLeft(callback: SocketEventCallback<unknown>): void {
    socketService.on('MEMBER_LEFT_CONVERSATION', callback as (...args: unknown[]) => void);
  }

  /**
   * Listen for conversation errors (real-time)
   */
  onConversationError(callback: SocketEventCallback<ConversationErrorResponse>): void {
    socketService.on('CONVERSATION_ERROR', callback as (...args: unknown[]) => void);
  }

  // ==================== CLEANUP METHODS ====================

  /**
   * Remove all real-time conversation listeners
   */
  removeAllListeners(): void {
    const realTimeEvents = [
      'CONVERSATION_UPDATED',
      'NEW_CONVERSATION_NOTIFICATION', 
      'CONVERSATION_DELETED_NOTIFICATION',
      'USER_TYPING',
      'USER_STOPPED_TYPING',
      'UNREAD_COUNT_CHANGED',
      'MEMBER_JOINED_CONVERSATION',
      'MEMBER_LEFT_CONVERSATION',
      'CONVERSATION_ERROR'
    ];

    realTimeEvents.forEach(event => {
      socketService.removeListener(event);
    });

    console.log('🧹 Removed all real-time conversation listeners');
  }

  /**
   * Remove specific listener
   */
  removeListener(event: string, callback?: SocketEventCallback): void {
    socketService.removeListener(event, callback);
  }
}

// Export singleton instance
export const conversationService = new ConversationSocketService();
export default conversationService;
