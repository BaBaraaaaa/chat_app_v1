import { Types } from "mongoose";
export interface ConversationResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}
export declare class ConversationService {
    /**
     * Tạo hoặc lấy conversation giữa 2 users (Direct chat)
     */
    static getOrCreateDirectConversation(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Lấy danh sách conversations của user
     */
    static getUserConversations(userId: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Lấy chi tiết conversation
     */
    static getConversationById(conversationId: Types.ObjectId, userId: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Xóa conversation (soft delete)
     */
    static deleteConversation(conversationId: Types.ObjectId, userId: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Reset unread count cho user trong conversation
     */
    static resetUnreadCount(conversationId: Types.ObjectId, userId: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Tìm kiếm conversations
     */
    static searchConversations(userId: Types.ObjectId, searchQuery: string): Promise<ConversationResponse>;
    /**
     * Lấy tổng số unread messages của user (tất cả conversations)
     */
    static getTotalUnreadCount(userId: Types.ObjectId): Promise<ConversationResponse>;
    /**
     * Cập nhật lastMessage của conversation (được gọi từ MessageService)
     */
    static updateLastMessage(conversationId: Types.ObjectId, messageData: {
        content: string;
        senderId: Types.ObjectId;
        type: string;
    }): Promise<ConversationResponse>;
}
//# sourceMappingURL=conversationService.d.ts.map