import { MessageService, SendMessageParams } from "../services/messageService";
import { ConversationService } from "../services/conversationService";
import { Types } from "mongoose";

/**
 * Message Controller - Xử lý business logic cho messages
 */
export class MessageController {
  /**
   * Gửi tin nhắn mới
   */
  async sendMessage(params: SendMessageParams) {
    try {
      // Gửi message qua MessageService
      const result = await MessageService.sendMessage(params);

      if (result.success) {
        // Cập nhật lastMessage trong conversation
        await ConversationService.updateLastMessage(
          params.conversationId,
          {
            content: params.content,
            senderId: params.senderId,
            type: params.type || 'text'
          }
        );
      }

      return result;
    } catch (error) {
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
  async getMessages(
    conversationId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    limit: number = 50,
    skip: number = 0
  ) {
    try {
      const convId = typeof conversationId === 'string' 
        ? new Types.ObjectId(conversationId) 
        : conversationId;
      
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await MessageService.getMessages(convId, userObjectId, limit, skip);
    } catch (error) {
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
  async markAsRead(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    try {
      const msgId = typeof messageId === 'string' 
        ? new Types.ObjectId(messageId) 
        : messageId;
      
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await MessageService.markAsRead(msgId, userObjectId);
    } catch (error) {
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
  async markAllAsRead(
    conversationId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    try {
      const convId = typeof conversationId === 'string' 
        ? new Types.ObjectId(conversationId) 
        : conversationId;
      
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      const result = await MessageService.markAllAsRead(convId, userObjectId);

      if (result.success) {
        // Reset unread count trong conversation
        await ConversationService.resetUnreadCount(convId, userObjectId);
      }

      return result;
    } catch (error) {
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
  async deleteMessage(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ) {
    try {
      const msgId = typeof messageId === 'string' 
        ? new Types.ObjectId(messageId) 
        : messageId;
      
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await MessageService.deleteMessage(msgId, userObjectId);
    } catch (error) {
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
  async editMessage(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    newContent: string
  ) {
    try {
      const msgId = typeof messageId === 'string' 
        ? new Types.ObjectId(messageId) 
        : messageId;
      
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await MessageService.editMessage(msgId, userObjectId, newContent);
    } catch (error) {
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
  async getUnreadCount(
    userId: Types.ObjectId | string,
    conversationId?: Types.ObjectId | string
  ) {
    try {
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;
      
      const convId = conversationId 
        ? (typeof conversationId === 'string' 
          ? new Types.ObjectId(conversationId) 
          : conversationId)
        : undefined;

      return await MessageService.getUnreadCount(userObjectId, convId);
    } catch (error) {
      console.error("Lỗi trong MessageController.getUnreadCount:", error);
      return {
        success: false,
        message: "Lỗi lấy số lượng tin nhắn chưa đọc",
        error
      };
    }
  }
}
