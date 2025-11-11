import { ConversationService } from "../services/conversationService";
import { Types } from "mongoose";

/**
 * Conversation Controller - Xử lý business logic cho conversations
 */
export class ConversationController {
  /**
   * Tạo hoặc lấy conversation giữa 2 users
   */
  async getOrCreateDirectConversation(
    userId1: Types.ObjectId | string,
    userId2: Types.ObjectId | string
  ) {
    try {
      const user1Id = typeof userId1 === 'string' 
        ? new Types.ObjectId(userId1) 
        : userId1;
      
      const user2Id = typeof userId2 === 'string' 
        ? new Types.ObjectId(userId2) 
        : userId2;

      return await ConversationService.getOrCreateDirectConversation(user1Id, user2Id);
    } catch (error) {
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
  async getUserConversations(userId: Types.ObjectId | string) {
    try {
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await ConversationService.getUserConversations(userObjectId);
    } catch (error) {
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
  async getConversationById(
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

      return await ConversationService.getConversationById(convId, userObjectId);
    } catch (error) {
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
  async deleteConversation(
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

      return await ConversationService.deleteConversation(convId, userObjectId);
    } catch (error) {
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
  async searchConversations(
    userId: Types.ObjectId | string,
    searchQuery: string
  ) {
    try {
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await ConversationService.searchConversations(userObjectId, searchQuery);
    } catch (error) {
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
  async getTotalUnreadCount(userId: Types.ObjectId | string) {
    try {
      const userObjectId = typeof userId === 'string' 
        ? new Types.ObjectId(userId) 
        : userId;

      return await ConversationService.getTotalUnreadCount(userObjectId);
    } catch (error) {
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
  async resetUnreadCount(
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

      return await ConversationService.resetUnreadCount(convId, userObjectId);
    } catch (error) {
      console.error("Lỗi trong ConversationController.resetUnreadCount:", error);
      return {
        success: false,
        message: "Lỗi reset unread count",
        error
      };
    }
  }
}
