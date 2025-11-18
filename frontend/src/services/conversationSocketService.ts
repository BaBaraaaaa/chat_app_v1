/**
 * Conversation Socket Service - Real-time events only
 * Handles live updates, notifications, typing indicators
 */

import { socketService } from './socketService';

export class ConversationSocketService {
  
  // ==================== REAL-TIME EVENTS ====================

  /**
   * Join conversation room for real-time updates
   */
  joinConversationRoom(conversationId: string): void {
    if (socketService.isConnected()) {
      socketService.emit('JOIN_CONVERSATION_ROOM', { conversationId });
      console.log('🏠 Joined conversation room:', conversationId);
    }
  }

  /**
   * Leave conversation room
   */
  leaveConversationRoom(conversationId: string): void {
    if (socketService.isConnected()) {
      socketService.emit('LEAVE_CONVERSATION_ROOM', { conversationId });
      console.log('🚪 Left conversation room:', conversationId);
    }
  }

  /**
   * Notify typing status
   */
  sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (socketService.isConnected()) {
      socketService.emit('TYPING_STATUS', { conversationId, isTyping });
    }
  }

  // ==================== REAL-TIME LISTENERS ====================

  /**
   * Listen for new conversation created (real-time notification)
   */
  onConversationCreated(callback: (data: any) => void): void {
    socketService.on('CONVERSATION_CREATED_NOTIFICATION', callback);
  }

  /**
   * Listen for conversation updated (real-time)
   */
  onConversationUpdated(callback: (data: any) => void): void {
    socketService.on('CONVERSATION_UPDATED', callback);
  }

  /**
   * Listen for conversation deleted (real-time)
   */
  onConversationDeleted(callback: (data: any) => void): void {
    socketService.on('CONVERSATION_DELETED', callback);
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(callback: (data: any) => void): void {
    socketService.on('USER_TYPING', callback);
  }

  /**
   * Listen for user stopped typing
   */
  onUserStoppedTyping(callback: (data: any) => void): void {
    socketService.on('USER_STOPPED_TYPING', callback);
  }

  /**
   * Listen for unread count changed (real-time)
   */
  onUnreadCountChanged(callback: (data: any) => void): void {
    socketService.on('UNREAD_COUNT_CHANGED', callback);
  }

  /**
   * Listen for conversation member joined
   */
  onMemberJoined(callback: (data: any) => void): void {
    socketService.on('MEMBER_JOINED_CONVERSATION', callback);
  }

  /**
   * Listen for conversation member left
   */
  onMemberLeft(callback: (data: any) => void): void {
    socketService.on('MEMBER_LEFT_CONVERSATION', callback);
  }

  // ==================== CLEANUP ====================

  /**
   * Remove all conversation-related listeners
   */
  removeAllListeners(): void {
    const events = [
      'CONVERSATION_CREATED_NOTIFICATION',
      'CONVERSATION_UPDATED', 
      'CONVERSATION_DELETED',
      'USER_TYPING',
      'USER_STOPPED_TYPING',
      'UNREAD_COUNT_CHANGED',
      'MEMBER_JOINED_CONVERSATION',
      'MEMBER_LEFT_CONVERSATION'
    ];

    events.forEach(event => {
      socketService.removeListener(event);
    });

    console.log('🧹 Removed all conversation socket listeners');
  }

  /**
   * Remove specific listener
   */
  removeListener(event: string): void {
    socketService.removeListener(event);
  }
}

// Export singleton instance
export const conversationSocketService = new ConversationSocketService();