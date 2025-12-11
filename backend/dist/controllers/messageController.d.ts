import { SendMessageParams } from "../services/messageService";
import { Types } from "mongoose";
/**
 * Message Controller - Xử lý business logic cho messages
 */
export declare class MessageController {
    /**
     * Gửi tin nhắn mới
     */
    sendMessage(params: SendMessageParams): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Lấy danh sách tin nhắn
     */
    getMessages(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string, limit?: number, skip?: number): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Đánh dấu tin nhắn đã đọc
     */
    markAsRead(messageId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Đánh dấu tất cả tin nhắn trong conversation đã đọc
     */
    markAllAsRead(conversationId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Xóa tin nhắn
     */
    deleteMessage(messageId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Chỉnh sửa tin nhắn
     */
    editMessage(messageId: Types.ObjectId | string, userId: Types.ObjectId | string, newContent: string): Promise<import("../services/messageService").MessageResponse>;
    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    getUnreadCount(userId: Types.ObjectId | string, conversationId?: Types.ObjectId | string): Promise<import("../services/messageService").MessageResponse>;
}
//# sourceMappingURL=messageController.d.ts.map