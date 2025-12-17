/**
 * Smart Notification Handler
 * Xử lý notifications tin nhắn mới mà không cần join tất cả conversations
 */

import { useCallback } from 'react';
import { useConversationStore } from '@/stores/useConversationStore';
import { useMessageStore } from '@/stores/useMessageStore';
import { smartConversationManager } from '@/utils/smartConversationManager';
import { toast } from 'sonner';
import type { 
  MessageNotificationData, 
  TypingNotificationData, 
  MessageReadNotificationData 
} from '@/types/message';
import type { SocketInstance } from '@/types/socket';

export const useSmartNotifications = () => {
  const { _updateConversation, conversations } = useConversationStore();
  const { joinConversation, _addMessage } = useMessageStore();

  /**
   * Xử lý tin nhắn mới từ notification
   * Auto-join conversation nếu cần thiết
   */
  const handleNewMessageNotification = useCallback((data: MessageNotificationData) => {
    const { message, conversation, unreadCount } = data;
    const conversationId = conversation._id;

    // 1. ✅ Update conversation với unread count mới
    _updateConversation(conversationId, {
      lastMessage: {
        content: message.content,
        senderId: message.senderId,
        sentAt: message.createdAt,
        type: message.type
      },
      unreadCount: unreadCount
    });

    // 2. ✅ Quyết định có join conversation không
    const shouldJoin = smartConversationManager.shouldJoinConversation(
      conversationId,
      {
        hasUnread: unreadCount > 0,
        isCurrentlyActive: false,
        hasRecentMessages: true,
        isFromNotification: true
      }
    );

    if (shouldJoin) {
      // Join với high priority (từ notification)
      const joined = smartConversationManager.joinConversation(
        conversationId,
        100, // High priority
        { hasUnread: unreadCount > 0 }
      );

      if (joined) {
        joinConversation(conversationId);
        
        // Add message to store
        _addMessage(conversationId, message);
      }
    } else {
      toast.info(`Bạn có tin nhắn mới. Vui lòng mở cuộc trò chuyện để xem tin nhắn.`, { duration: 6000 });
    }

    // 3. ✅ Show toast notification nếu không phải conversation đang active
    const currentConv = conversations?.find(c => c._id === conversationId);
    if (!currentConv?.isActive) {
      const senderName = message.senderId.displayName || message.senderId.username;
      toast.info(`💬 ${senderName}: ${message.content}`, {
        duration: 4000,
        action: {
          label: 'Mở',
          onClick: () => {
            // Force join và switch to conversation
            smartConversationManager.joinConversation(conversationId, 200);
            joinConversation(conversationId);
            // TODO: Switch to conversation in UI
          }
        }
      });
    }
  }, [_updateConversation, _addMessage, joinConversation, conversations]);

  /**
   * Xử lý typing notification
   */
  const handleTypingNotification = useCallback((data: TypingNotificationData) => {
    const { conversationId, isTyping } = data;

    // Update priority nếu conversation đã join
    if (smartConversationManager.getJoinedConversations().includes(conversationId)) {
      smartConversationManager.updateConversationPriority(
        conversationId,
        10, // Medium priority
        { isTyping }
      );
    }

    // TODO: Update typing indicator in UI
  }, []);

  /**
   * Xử lý message read notification
   */
  const handleMessageReadNotification = useCallback((data: MessageReadNotificationData) => {
    // Chỉ xử lý nếu conversation đang active
    if (smartConversationManager.getJoinedConversations().includes(data.conversationId)) {
      // TODO: Update message status in UI
    }
  }, []);

  return {
    handleNewMessageNotification,
    handleTypingNotification,
    handleMessageReadNotification,
  };
};

/**
 * Hook để setup smart notification listeners
 */
export const useSmartNotificationSetup = () => {
  const {
    handleNewMessageNotification,
    handleTypingNotification,
    handleMessageReadNotification,
  } = useSmartNotifications();

  const setupNotificationListeners = useCallback((socket: SocketInstance) => {
    // Listen for global notifications (không cần join room)
    socket.on<MessageNotificationData>('NEW_MESSAGE_NOTIFICATION', handleNewMessageNotification);
    socket.on<TypingNotificationData>('USER_TYPING', handleTypingNotification);
    socket.on<MessageReadNotificationData>('MESSAGE_READ', handleMessageReadNotification);


    return () => {
      socket.off<MessageNotificationData>('NEW_MESSAGE_NOTIFICATION', handleNewMessageNotification);
      socket.off<TypingNotificationData>('USER_TYPING', handleTypingNotification);
      socket.off<MessageReadNotificationData>('MESSAGE_READ', handleMessageReadNotification);
    };
  }, [handleNewMessageNotification, handleTypingNotification, handleMessageReadNotification]);

  return { setupNotificationListeners };
};