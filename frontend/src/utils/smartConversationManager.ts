/**
 * Smart Conversation Manager
 * Quản lý việc join/leave conversations một cách thông minh
 * để tối ưu performance và resources
 */

export interface ConversationPriority {
  id: string;
  priority: number; // Higher = more important
  lastActive: number;
  hasUnread: boolean;
  isTyping: boolean;
}

export class SmartConversationManager {
  private joinedConversations = new Set<string>();
  private conversationPriorities = new Map<string, ConversationPriority>();
  private maxActiveConversations = 5;
  private inactivityThreshold = 5 * 60 * 1000; // 5 minutes

  constructor(maxActive: number = 5) {
    this.maxActiveConversations = maxActive;
  }

  /**
   * Quyết định có nên join conversation hay không
   */
  shouldJoinConversation(
    options: {
      hasUnread?: boolean;
      isCurrentlyActive?: boolean;
      hasRecentMessages?: boolean;
      isFromNotification?: boolean;
    }
  ): boolean {
    // Always join if currently active
    if (options.isCurrentlyActive) {
      return true;
    }

    // Join if from notification (new message)
    if (options.isFromNotification) {
      return true;
    }

    // Join if has unread messages
    if (options.hasUnread) {
      return true;
    }

    // Join if has recent messages and not at max capacity
    if (options.hasRecentMessages && this.joinedConversations.size < this.maxActiveConversations) {
      return true;
    }

    return false;
  }

  /**
   * Join conversation with priority management
   */
  joinConversation(
    conversationId: string,
    priority: number = 0,
    options: {
      hasUnread?: boolean;
      isTyping?: boolean;
    } = {}
  ): boolean {
    // If already joined, update priority
    if (this.joinedConversations.has(conversationId)) {
      this.updateConversationPriority(conversationId, priority, options);
      return true;
    }

    // If at max capacity, try to remove lowest priority conversation
    if (this.joinedConversations.size >= this.maxActiveConversations) {
      const removed = this.removeLowestPriorityConversation();
      if (!removed) {
        console.warn('🚫 Cannot join conversation: at max capacity and no conversations to remove');
        return false;
      }
    }

    // Join the conversation
    this.joinedConversations.add(conversationId);
    this.conversationPriorities.set(conversationId, {
      id: conversationId,
      priority,
      lastActive: Date.now(),
      hasUnread: options.hasUnread || false,
      isTyping: options.isTyping || false,
    });

    return true;
  }

  /**
   * Leave conversation
   */
  leaveConversation(conversationId: string): boolean {
    if (!this.joinedConversations.has(conversationId)) {
      return false;
    }

    this.joinedConversations.delete(conversationId);
    this.conversationPriorities.delete(conversationId);
    
    return true;
  }

  /**
   * Update conversation priority
   */
  updateConversationPriority(
    conversationId: string,
    priority: number,
    options: {
      hasUnread?: boolean;
      isTyping?: boolean;
    } = {}
  ): void {
    const existing = this.conversationPriorities.get(conversationId);
    if (!existing) return;

    this.conversationPriorities.set(conversationId, {
      ...existing,
      priority: Math.max(existing.priority, priority),
      lastActive: Date.now(),
      hasUnread: options.hasUnread ?? existing.hasUnread,
      isTyping: options.isTyping ?? existing.isTyping,
    });
  }

  /**
   * Remove lowest priority conversation
   */
  private removeLowestPriorityConversation(): boolean {
    if (this.conversationPriorities.size === 0) return false;

    let lowestPriority = Infinity;
    let oldestTime = Date.now();
    let conversationToRemove = '';

    // Find conversation with lowest priority and oldest activity
    for (const [id, data] of this.conversationPriorities.entries()) {
      // Don't remove conversations with unread messages or typing
      if (data.hasUnread || data.isTyping) continue;
      
      // Don't remove recently active conversations
      if (Date.now() - data.lastActive < this.inactivityThreshold) continue;

      if (data.priority < lowestPriority || 
          (data.priority === lowestPriority && data.lastActive < oldestTime)) {
        lowestPriority = data.priority;
        oldestTime = data.lastActive;
        conversationToRemove = id;
      }
    }

    if (conversationToRemove) {
      this.leaveConversation(conversationToRemove);
      return true;
    }

    return false;
  }

  /**
   * Get all joined conversations
   */
  getJoinedConversations(): string[] {
    return Array.from(this.joinedConversations);
  }

  /**
   * Get conversation priorities (for debugging)
   */
  getConversationPriorities(): ConversationPriority[] {
    return Array.from(this.conversationPriorities.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Cleanup inactive conversations
   */
  cleanupInactiveConversations(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, data] of this.conversationPriorities.entries()) {
      // Don't cleanup conversations with unread or typing
      if (data.hasUnread || data.isTyping) continue;
      
      if (now - data.lastActive > this.inactivityThreshold) {
        toRemove.push(id);
      }
    }

    toRemove.forEach(id => this.leaveConversation(id));
    
  }
}

// Export singleton instance
export const smartConversationManager = new SmartConversationManager(5);