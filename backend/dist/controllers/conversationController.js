"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const conversationService_1 = require("../services/conversationService");
const mongoose_1 = require("mongoose");
/**
 * Conversation Controller - Xử lý business logic cho conversations
 */
class ConversationController {
    /**
     * Tạo hoặc lấy conversation giữa 2 users
     */
    async getOrCreateDirectConversation(userId1, userId2) {
        try {
            const user1Id = typeof userId1 === 'string'
                ? new mongoose_1.Types.ObjectId(userId1)
                : userId1;
            const user2Id = typeof userId2 === 'string'
                ? new mongoose_1.Types.ObjectId(userId2)
                : userId2;
            return await conversationService_1.ConversationService.getOrCreateDirectConversation(user1Id, user2Id);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.getOrCreateDirectConversation:", error);
            return {
                success: false,
                message: "Lỗi tạo/lấy cuộc hội thoại",
                error
            };
        }
    }
    /**
     * Lấy danh sách conversations của user
     */
    async getUserConversations(userId) {
        try {
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.getUserConversations(userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.getUserConversations:", error);
            return {
                success: false,
                message: "Lỗi lấy danh sách cuộc hội thoại",
                error
            };
        }
    }
    /**
     * Lấy chi tiết conversation
     */
    async getConversationById(conversationId, userId) {
        try {
            const convId = typeof conversationId === 'string'
                ? new mongoose_1.Types.ObjectId(conversationId)
                : conversationId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.getConversationById(convId, userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.getConversationById:", error);
            return {
                success: false,
                message: "Lỗi lấy chi tiết cuộc hội thoại",
                error
            };
        }
    }
    /**
     * Xóa conversation
     */
    async deleteConversation(conversationId, userId) {
        try {
            const convId = typeof conversationId === 'string'
                ? new mongoose_1.Types.ObjectId(conversationId)
                : conversationId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.deleteConversation(convId, userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.deleteConversation:", error);
            return {
                success: false,
                message: "Lỗi xóa cuộc hội thoại",
                error
            };
        }
    }
    /**
     * Tìm kiếm conversations
     */
    async searchConversations(userId, searchQuery) {
        try {
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.searchConversations(userObjectId, searchQuery);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.searchConversations:", error);
            return {
                success: false,
                message: "Lỗi tìm kiếm cuộc hội thoại",
                error
            };
        }
    }
    /**
     * Lấy tổng số tin nhắn chưa đọc
     */
    async getTotalUnreadCount(userId) {
        try {
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.getTotalUnreadCount(userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.getTotalUnreadCount:", error);
            return {
                success: false,
                message: "Lỗi lấy tổng số tin nhắn chưa đọc",
                error
            };
        }
    }
    /**
     * Reset unread count
     */
    async resetUnreadCount(conversationId, userId) {
        try {
            const convId = typeof conversationId === 'string'
                ? new mongoose_1.Types.ObjectId(conversationId)
                : conversationId;
            const userObjectId = typeof userId === 'string'
                ? new mongoose_1.Types.ObjectId(userId)
                : userId;
            return await conversationService_1.ConversationService.resetUnreadCount(convId, userObjectId);
        }
        catch (error) {
            console.error("Lỗi trong ConversationController.resetUnreadCount:", error);
            return {
                success: false,
                message: "Lỗi reset unread count",
                error
            };
        }
    }
}
exports.ConversationController = ConversationController;
//# sourceMappingURL=conversationController.js.map