import { Types } from "mongoose";
/**
 * Conversation Controller - Xử lý business logic cho conversations
 */
export declare class ConversationController {
    /**
     * Tạo hoặc lấy conversation giữa 2 users
     */
    getOrCreateDirectConversation(userId1: Types.ObjectId | string, userId2: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Lấy danh sách conversations của user
     */
    getUserConversations(userId: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Lấy chi tiết conversation
     */
    getConversationById(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Xóa conversation
     */
    deleteConversation(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Tìm kiếm conversations
     */
    searchConversations(userId: Types.ObjectId | string, searchQuery: string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Lấy tổng số tin nhắn chưa đọc
     */
    getTotalUnreadCount(userId: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
    /**
     * Reset unread count
     */
    resetUnreadCount(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/conversationService").ConversationResponse>;
}
//# sourceMappingURL=conversationController.d.ts.map