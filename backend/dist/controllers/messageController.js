"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const messageService_1 = require("../services/messageService");
const conversationService_1 = require("../services/conversationService");
const mongoose_1 = require("mongoose");
/**
 * Message Controller - Xử lý business logic cho messages
 */
class MessageController {
    /**
     * Gửi tin nhắn mới
     */
    async sendMessage(params) {
        try {
            // Gửi message qua MessageService
            const result = await messageService_1.MessageService.sendMessage(params);
            if (result.success) {
                // Cập nhật lastMessage trong conversation
                await conversationService_1.ConversationService.updateLastMessage(params.conversationId, {
                    content: params.content,
                    senderId: params.senderId,
                    type: params.type || 'text'
                });
            }
            return result;
        }
        catch (error) {
            console.error("Lỗi trong MessageController.sendMessage:", error);
            return {
                success: false,
                message: "Lỗi gửi tin nhắn",
                error
            };
        }
    }
    /**
     * Lấy danh sách tin nhắn
     */
    async getMessages(conversationId, userId, limit = 50, skip = 0) {
        try {
            const convId = typeof conversationId === 'string'
                ? new mongoose_1.Types.ObjectId(conversationId)
                : conversationId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await messageService_1.MessageService.getMessages(convId, userObjectId, limit, skip);
        }
        catch (error) {
            console.error("Lỗi trong MessageController.getMessages:", error);
            return {
                success: false,
                message: "Lỗi lấy tin nhắn",
                error
            };
        }
    }
    /**
     * Đánh dấu tin nhắn đã đọc
     */
    async markAsRead(messageId, userId) {
        try {
            const msgId = typeof messageId === 'string'
                ? new mongoose_1.Types.ObjectId(messageId)
                : messageId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await messageService_1.MessageService.markAsRead(msgId, userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong MessageController.markAsRead:", error);
            return {
                success: false,
                message: "Lỗi đánh dấu tin nhắn",
                error
            };
        }
    }
    /**
     * Đánh dấu tất cả tin nhắn trong conversation đã đọc
     */
    async markAllAsRead(conversationId, userId) {
        try {
            const convId = typeof conversationId === 'string'
                ? new mongoose_1.Types.ObjectId(conversationId)
                : conversationId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            const result = await messageService_1.MessageService.markAllAsRead(convId, userObjectId);
            if (result.success) {
                // Reset unread count trong conversation
                await conversationService_1.ConversationService.resetUnreadCount(convId, userObjectId);
            }
            return result;
        }
        catch (error) {
            console.error("Lỗi trong MessageController.markAllAsRead:", error);
            return {
                success: false,
                message: "Lỗi đánh dấu tất cả tin nhắn",
                error
            };
        }
    }
    /**
     * Xóa tin nhắn
     */
    async deleteMessage(messageId, userId) {
        try {
            const msgId = typeof messageId === 'string'
                ? new mongoose_1.Types.ObjectId(messageId)
                : messageId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await messageService_1.MessageService.deleteMessage(msgId, userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong MessageController.deleteMessage:", error);
            return {
                success: false,
                message: "Lỗi xóa tin nhắn",
                error
            };
        }
    }
    /**
     * Chỉnh sửa tin nhắn
     */
    async editMessage(messageId, userId, newContent) {
        try {
            const msgId = typeof messageId === 'string'
                ? new mongoose_1.Types.ObjectId(messageId)
                : messageId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await messageService_1.MessageService.editMessage(msgId, userObjectId, newContent);
        }
        catch (error) {
            console.error("Lỗi trong MessageController.editMessage:", error);
            return {
                success: false,
                message: "Lỗi chỉnh sửa tin nhắn",
                error
            };
        }
    }
    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    async getUnreadCount(userId, conversationId) {
        try {
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            const convId = conversationId
                ? (typeof conversationId === 'string'
                    ? new mongoose_1.Types.ObjectId(conversationId)
                    : conversationId)
                : undefined;
            return await messageService_1.MessageService.getUnreadCount(userObjectId, convId);
        }
        catch (error) {
            console.error("Lỗi trong MessageController.getUnreadCount:", error);
            return {
                success: false,
                message: "Lỗi lấy số lượng tin nhắn chưa đọc",
                error
            };
        }
    }
}
exports.MessageController = MessageController;
//# sourceMappingURL=messageController.js.map