import { MessageType } from "../models/Message";
import { Types } from "mongoose";
export interface SendMessageParams {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    type?: MessageType;
    attachments?: {
        url: string;
        filename: string;
        fileType: string;
        fileSize: number;
    }[];
    replyTo?: Types.ObjectId;
}
export interface MessageResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}
export declare class MessageService {
    /**
     * Gửi tin nhắn mới
     */
    static sendMessage(params: SendMessageParams): Promise<MessageResponse>;
    /**
     * Lấy danh sách tin nhắn trong conversation
     */
    static getMessages(conversationId: Types.ObjectId, userId: Types.ObjectId, limit?: number, skip?: number): Promise<MessageResponse>;
    /**
     * Đánh dấu tin nhắn đã đọc
     */
    static markAsRead(messageId: Types.ObjectId, userId: Types.ObjectId): Promise<MessageResponse>;
    /**
     * Đánh dấu tất cả tin nhắn trong conversation đã đọc
     */
    static markAllAsRead(conversationId: Types.ObjectId, userId: Types.ObjectId): Promise<MessageResponse>;
    /**
     * Xóa tin nhắn (soft delete)
     */
    static deleteMessage(messageId: Types.ObjectId, userId: Types.ObjectId): Promise<MessageResponse>;
    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    static getUnreadCount(userId: Types.ObjectId, conversationId?: Types.ObjectId): Promise<MessageResponse>;
    /**
     * Chỉnh sửa tin nhắn
     */
    static editMessage(messageId: Types.ObjectId, userId: Types.ObjectId, newContent: string): Promise<MessageResponse>;
}
//# sourceMappingURL=messageService.d.ts.map