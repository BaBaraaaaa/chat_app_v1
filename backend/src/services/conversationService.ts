import Conversation, { IConversation, ConversationType } from "../models/Conversation";
import Message from "../models/Message";
import User from "../models/User";
import { Types } from "mongoose";

export interface ConversationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export class ConversationService {
  /**
   * Tạo hoặc lấy conversation giữa 2 users (Direct chat)
   */
  static async getOrCreateDirectConversation(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      // Kiểm tra cả 2 users có tồn tại không
      const [user1, user2] = await Promise.all([
        User.findById(userId1),
        User.findById(userId2)
      ]);

      if (!user1 || !user2) {
        return {
          success: false,
          message: "Người dùng không tồn tại"
        };
      }

      // Không thể chat với chính mình
      if (userId1.toString() === userId2.toString()) {
        return {
          success: false,
          message: "Không thể tạo cuộc hội thoại với chính mình"
        };
      }

      // Tìm conversation đã tồn tại
      let conversation = await Conversation.findOne({
        type: ConversationType.DIRECT,
        participants: { $all: [userId1, userId2], $size: 2 }
      }).populate('participants', 'username displayName avatar firstName lastName email');

      // Nếu chưa có thì tạo mới
      if (!conversation) {
        conversation = await Conversation.create({
          type: ConversationType.DIRECT,
          participants: [userId1, userId2],
          unreadCount: new Map([
            [userId1.toString(), 0],
            [userId2.toString(), 0]
          ])
        });

        // Populate sau khi tạo
        conversation = await Conversation.findById(conversation._id)
          .populate('participants', 'username displayName avatar firstName lastName email');
      }

      return {
        success: true,
        message: "Lấy cuộc hội thoại thành công",
        data: conversation
      };
    } catch (error) {
      console.error("Lỗi tạo/lấy conversation:", error);
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
  static async getUserConversations(
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversations = await Conversation.find({
        participants: userId,
        isActive: true
      })
        .populate('participants', 'username displayName avatar firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatar')
        .sort({ 'lastMessage.sentAt': -1 });

      // Thêm thông tin unread count cho user hiện tại
      const conversationsWithUnread = conversations.map(conv => {
        const convObj = conv.toObject();
        return {
          ...convObj,
          unreadCount: conv.unreadCount.get(userId.toString()) || 0
        };
      });

      return {
        success: true,
        message: "Lấy danh sách cuộc hội thoại thành công",
        data: conversationsWithUnread
      };
    } catch (error) {
      console.error("Lỗi lấy danh sách conversations:", error);
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
  static async getConversationById(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'username displayName avatar firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatar');

      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      // Kiểm tra user có phải participant không
      const isParticipant = conversation.participants.some(
        (p: any) => p._id.toString() === userId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền truy cập cuộc hội thoại này"
        };
      }

      const convObj = conversation.toObject();
      return {
        success: true,
        message: "Lấy chi tiết cuộc hội thoại thành công",
        data: {
          ...convObj,
          unreadCount: conversation.unreadCount.get(userId.toString()) || 0
        }
      };
    } catch (error) {
      console.error("Lỗi lấy chi tiết conversation:", error);
      return {
        success: false,
        message: "Lỗi lấy chi tiết cuộc hội thoại",
        error
      };
    }
  }

  /**
   * Xóa conversation (soft delete)
   */
  static async deleteConversation(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      // Kiểm tra user có phải participant không
      const isParticipant = conversation.participants.some(
        p => p.toString() === userId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền xóa cuộc hội thoại này"
        };
      }

      // Soft delete
      conversation.isActive = false;
      await conversation.save();

      return {
        success: true,
        message: "Đã xóa cuộc hội thoại",
        data: conversation
      };
    } catch (error) {
      console.error("Lỗi xóa conversation:", error);
      return {
        success: false,
        message: "Lỗi xóa cuộc hội thoại",
        error
      };
    }
  }

  /**
   * Reset unread count cho user trong conversation
   */
  static async resetUnreadCount(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          [`unreadCount.${userId.toString()}`]: 0
        },
        { new: true }
      )
        .populate('participants', 'username displayName avatar firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatar');

      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      // ✅ Transform unreadCount Map thành số cho user hiện tại
      const convObj = conversation.toObject();
      const transformedConv = {
        ...convObj,
        unreadCount: conversation.unreadCount.get(userId.toString()) || 0
      };

      return {
        success: true,
        message: "Đã reset unread count",
        data: transformedConv
      };
    } catch (error) {
      console.error("Lỗi reset unread count:", error);
      return {
        success: false,
        message: "Lỗi reset unread count",
        error
      };
    }
  }

  /**
   * Tìm kiếm conversations
   */
  static async searchConversations(
    userId: Types.ObjectId,
    searchQuery: string
  ): Promise<ConversationResponse> {
    try {
      // Tìm conversations mà user là participant
      const conversations = await Conversation.find({
        participants: userId,
        isActive: true
      })
        .populate('participants', 'username displayName avatar firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatar');

      // Filter conversations dựa vào tên người tham gia hoặc lastMessage
      const filtered = conversations.filter(conv => {
        // Tìm trong tên participants
        const matchParticipant = conv.participants.some((p: any) => {
          if (p._id.toString() === userId.toString()) return false; // Bỏ qua chính mình
          const fullName = `${p.displayName || ''} ${p.username || ''}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        });

        // Tìm trong lastMessage content
        const matchMessage = conv.lastMessage?.content
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

        return matchParticipant || matchMessage;
      });

      return {
        success: true,
        message: "Tìm kiếm cuộc hội thoại thành công",
        data: filtered
      };
    } catch (error) {
      console.error("Lỗi tìm kiếm conversations:", error);
      return {
        success: false,
        message: "Lỗi tìm kiếm cuộc hội thoại",
        error
      };
    }
  }

  /**
   * Lấy tổng số unread messages của user (tất cả conversations)
   */
  static async getTotalUnreadCount(
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversations = await Conversation.find({
        participants: userId,
        isActive: true
      });

      let totalUnread = 0;
      conversations.forEach(conv => {
        totalUnread += conv.unreadCount.get(userId.toString()) || 0;
      });

      return {
        success: true,
        message: "Lấy tổng số tin nhắn chưa đọc thành công",
        data: { totalUnread }
      };
    } catch (error) {
      console.error("Lỗi lấy tổng số unread:", error);
      return {
        success: false,
        message: "Lỗi lấy tổng số tin nhắn chưa đọc",
        error
      };
    }
  }

  /**
   * Cập nhật lastMessage của conversation (được gọi từ MessageService)
   */
  static async updateLastMessage(
    conversationId: Types.ObjectId,
    messageData: {
      content: string;
      senderId: Types.ObjectId;
      type: string;
    }
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: {
            content: messageData.content,
            senderId: messageData.senderId,
            sentAt: new Date(),
            type: messageData.type
          }
        },
        { new: true }
      );

      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      return {
        success: true,
        message: "Đã cập nhật lastMessage",
        data: conversation
      };
    } catch (error) {
      console.error("Lỗi cập nhật lastMessage:", error);
      return {
        success: false,
        message: "Lỗi cập nhật lastMessage",
        error
      };
    }
  }
}
