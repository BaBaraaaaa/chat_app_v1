/**
 * Message Service - Socket.IO operations for messaging
 * Handles real-time message communication with backend
 */

import { toast } from 'sonner';
import { socketService } from './socketService';
import type {
    SendMessagePayload,
    MessageSentResponse,
    NewMessageResponse,
    GetMessagesPayload,
    MessagesListResponse,
    MarkMessageReadPayload,
    MarkReadSuccessResponse,
    MessageReadResponse,
    MarkAllReadPayload,
    MarkAllReadSuccessResponse,
    DeleteMessagePayload,
    DeleteMessageSuccessResponse,
    MessageDeletedResponse,
    EditMessagePayload,
    MessageEditedResponse,
    TypingPayload,
    UserTypingResponse,
    GetUnreadCountPayload,
    UnreadCountResponse,
    JoinConversationPayload,
    LeaveConversationPayload,
    MessageErrorResponse,
    SocketEventCallback,
    MessageNotificationData
} from '@/types/message';

class MessageService {
    // ==================== UTILITY METHODS ====================

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return socketService.isConnected();
    }

    // ==================== EMIT METHODS (Client → Server) ====================

    /**
     * Gửi tin nhắn mới
     */
    sendMessage(payload: SendMessagePayload): void {
        if (socketService.isConnected()) {
            socketService.emit('SEND_MESSAGE', payload);
        } else {
            console.warn('⚠️ Socket chưa kết nối, không thể gửi tin nhắn');
        }
    }

    /**
     * Lấy danh sách tin nhắn
     */
    getMessages(payload: GetMessagesPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('GET_MESSAGES', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể lấy tin nhắn');
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    markMessageAsRead(payload: MarkMessageReadPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('MARK_MESSAGE_READ', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể đánh dấu đã đọc');
        }
    }

    /**
     * Đánh dấu tất cả tin nhắn đã đọc
     */
    markAllAsRead(payload: MarkAllReadPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('MARK_ALL_READ', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể đánh dấu đã đọc');
        }
    }

    /**
     * Xóa tin nhắn
     */
    deleteMessage(payload: DeleteMessagePayload): void {
        if (socketService.isConnected()) {
            socketService.emit('DELETE_MESSAGE', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể xóa tin nhắn');
        }
    }

    /**
     * Chỉnh sửa tin nhắn
     */
    editMessage(payload: EditMessagePayload): void {
        if (socketService.isConnected()) {
            socketService.emit('EDIT_MESSAGE', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể chỉnh sửa tin nhắn');
        }
    }

    /**
     * Bắt đầu typing
     */
    startTyping(payload: TypingPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('TYPING_START', payload);
        }
    }

    /**
     * Dừng typing
     */
    stopTyping(payload: TypingPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('TYPING_STOP', payload);
        }
    }

    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    getUnreadCount(payload?: GetUnreadCountPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('GET_UNREAD_COUNT', payload);
        } else {
            toast.warning('⚠️ Socket chưa kết nối, không thể lấy số lượng chưa đọc');
        }
    }

    /**
     * Join conversation room
     */
    joinConversation(payload: JoinConversationPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('JOIN_CONVERSATION', payload);
        }
    }

    /**
     * Leave conversation room
     */
    leaveConversation(payload: LeaveConversationPayload): void {
        if (socketService.isConnected()) {
            socketService.emit('LEAVE_CONVERSATION', payload);
        }
    }

    // ==================== LISTENER METHODS (Server → Client) ====================

    /**
     * Listen for message sent success
     */
    onMessageSent(callback: SocketEventCallback<MessageSentResponse>): void {
        socketService.on('MESSAGE_SENT', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for new message (real-time)
     */
    onNewMessage(callback: SocketEventCallback<NewMessageResponse>): void {
        socketService.on('NEW_MESSAGE', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for messages list
     */
    onMessagesList(callback: SocketEventCallback<MessagesListResponse>): void {
        socketService.on('MESSAGES_LIST', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for mark read success
     */
    onMarkReadSuccess(callback: SocketEventCallback<MarkReadSuccessResponse>): void {
        socketService.on('MARK_READ_SUCCESS', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for message read notification (sender receives this)
     */
    onMessageRead(callback: SocketEventCallback<MessageReadResponse>): void {
        socketService.on('MESSAGE_READ', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for mark all read success
     */
    onMarkAllReadSuccess(callback: SocketEventCallback<MarkAllReadSuccessResponse>): void {
        socketService.on('MARK_ALL_READ_SUCCESS', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for delete message success
     */
    onDeleteMessageSuccess(callback: SocketEventCallback<DeleteMessageSuccessResponse>): void {
        socketService.on('DELETE_MESSAGE_SUCCESS', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for message deleted (real-time)
     */
    onMessageDeleted(callback: SocketEventCallback<MessageDeletedResponse>): void {
        socketService.on('MESSAGE_DELETED', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for edit message success
     */
    // onEditMessageSuccess(callback: SocketEventCallback<EditMessageSuccessResponse>): void {
    //     socketService.on('EDIT_MESSAGE_SUCCESS', callback as (...args: unknown[]) => void);
    // }

    /**
     * Listen for message edited (real-time)
     */
    onMessageEdited(callback: SocketEventCallback<MessageEditedResponse>): void {
        socketService.on('MESSAGE_EDITED', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for typing indicator
     */
    onUserTyping(callback: SocketEventCallback<UserTypingResponse>): void {
        socketService.on('USER_TYPING', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for unread count
     */
    onUnreadCount(callback: SocketEventCallback<UnreadCountResponse>): void {
        socketService.on('UNREAD_COUNT', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for message notification (global, không cần join room)
     */
    onMessageNotification(callback: SocketEventCallback<MessageNotificationData>): void {
        socketService.on('NEW_MESSAGE_NOTIFICATION', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for message errors
     */
    onMessageError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('MESSAGE_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for messages errors
     */
    onMessagesError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('MESSAGES_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for mark read error
     */
    onMarkReadError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('MARK_READ_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for mark all read error
     */
    onMarkAllReadError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('MARK_ALL_READ_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for delete message error
     */
    onDeleteMessageError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('DELETE_MESSAGE_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for edit message error
     */
    onEditMessageError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('EDIT_MESSAGE_ERROR', callback as (...args: unknown[]) => void);
    }

    /**
     * Listen for unread count error
     */
    onUnreadCountError(callback: SocketEventCallback<MessageErrorResponse>): void {
        socketService.on('UNREAD_COUNT_ERROR', callback as (...args: unknown[]) => void);
    }

    // ==================== CLEANUP METHODS ====================

    /**
     * Remove all message listeners
     */
    removeAllListeners(): void {
        socketService.removeListener('MESSAGE_SENT');
        socketService.removeListener('NEW_MESSAGE');
        socketService.removeListener('MESSAGES_LIST');
        socketService.removeListener('MARK_READ_SUCCESS');
        socketService.removeListener('MESSAGE_READ');
        socketService.removeListener('MARK_ALL_READ_SUCCESS');
        socketService.removeListener('DELETE_MESSAGE_SUCCESS');
        socketService.removeListener('MESSAGE_DELETED');
        socketService.removeListener('MESSAGE_EDITED');
        socketService.removeListener('USER_TYPING');
        socketService.removeListener('UNREAD_COUNT');
        socketService.removeListener('NEW_MESSAGE_NOTIFICATION');
        socketService.removeListener('MESSAGE_ERROR');
        socketService.removeListener('MESSAGES_ERROR');
        socketService.removeListener('MARK_READ_ERROR');
        socketService.removeListener('MARK_ALL_READ_ERROR');
        socketService.removeListener('DELETE_MESSAGE_ERROR');
        socketService.removeListener('EDIT_MESSAGE_ERROR');
        socketService.removeListener('UNREAD_COUNT_ERROR');
    }

    /**
     * Remove specific listener
     */
    removeListener(event: string, callback?: SocketEventCallback): void {
        socketService.removeListener(event, callback);
    }
}

// Export singleton instance
export const messageService = new MessageService();
export default messageService;
