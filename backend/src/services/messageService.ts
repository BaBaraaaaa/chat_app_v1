import Message, { IMessage, MessageStatus, MessageType } from "../models/Message";
import Conversation from "../models/Conversation";
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

export class MessageService {
  /**
   * Gửi tin nhắn mới
   */
  static async sendMessage(params: SendMessageParams): Promise<MessageResponse> {
    try {
      const {
        conversationId,
        senderId,
        receiverId,
        content,
        type = MessageType.TEXT,
        attachments = [],
        replyTo
      } = params;

      // Validate content
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          message: "Nội dung tin nhắn không được để trống"
        };
      }

      // Kiểm tra conversation tồn tại
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      // Kiểm tra user có trong conversation không
      const isParticipant = conversation.participants.some(
        p => p.toString() === senderId.toString()
      );
      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này"
        };
      }

      // Tạo message mới
      const newMessage = await Message.create({
        conversationId,
        senderId,
        receiverId,
        content: content.trim(),
        type,
        attachments,
        replyTo,
        status: MessageStatus.SENT
      });

      // Populate thông tin sender
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('senderId', 'username displayName avatarUrl firstName lastName')
        .populate('receiverId', 'username displayName avatarUrl firstName lastName')
        .populate('replyTo');

      // Cập nhật lastMessage trong conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content: content.trim(),
          senderId,
          sentAt: new Date(),
          type
        },
        // Tăng unread count cho receiver
        $inc: {
          [`unreadCount.${receiverId.toString()}`]: 1
        }
      });

      return {
        success: true,
        message: "Gửi tin nhắn thành công",
        data: populatedMessage
      };
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      return {
        success: false,
        message: "Lỗi gửi tin nhắn",
        error
      };
    }
  }

  /**
   * Lấy danh sách tin nhắn trong conversation
   */
  static async getMessages(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    limit: number = 50,
    skip: number = 0
  ): Promise<MessageResponse> {
    try {
      // Kiểm tra user có quyền xem conversation không
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      const isParticipant = conversation.participants.some(
        p => p.toString() === userId.toString()
      );
      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền xem tin nhắn trong cuộc hội thoại này"
        };
      }

      // Lấy messages
      const messages = await Message.find({
        conversationId,
        isDeleted: false
      })
        .populate('senderId', 'username displayName avatarUrl firstName lastName')
        .populate('receiverId', 'username displayName avatarUrl firstName lastName')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Message.countDocuments({
        conversationId,
        isDeleted: false
      });

      return {
        success: true,
        message: "Lấy tin nhắn thành công",
        data: {
          messages,
          total,
          hasMore: skip + messages.length < total
        }
      };
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
      return {
        success: false,
        message: "Lỗi lấy tin nhắn",
        error
      };
    }
  }

  static async getMessagesByCursor(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId,
    limit: number = 50,
    cursor?: string
  ): Promise<MessageResponse> {
    try {
      // Kiểm tra user có quyền xem conversation không
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return {
          success: false,
          message: "Cuộc hội thoại không tồn tại"
        };
      }

      const isParticipant = conversation.participants.some(
        p => p.toString() === userId.toString()
      );
      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền xem tin nhắn trong cuộc hội thoại này"
        };
      }
      // Xây dựng query với cursor nếu có
      const query: any = {
        conversationId,
        isDeleted: false
      }
      if (cursor) {
        query._id = { $lt: new Types.ObjectId(cursor) }; //lấy các message có id nhỏ hơn cursor
      }
      else {
        query._id = { $exists: true }; //lấy tất cả message
      }
      // Lấy messages
      const message = await Message.find<IMessage>(query)
        .populate('senderId', 'username displayName avatarUrl firstName lastName')
        .populate('receiverId', 'username displayName avatarUrl firstName lastName')
        .populate('replyTo')
        .sort({ _id: -1 })
        .limit(limit + 1); //lấy thêm 1 message để kiểm tra còn tin nhắn tiếp theo hay không


      // Xác định hasMore và cursor mới
      const hasMore = message.length > limit;
      if (hasMore) {
        message.pop(); //loại bỏ message thừa
      }
      // Cursor mới là id của message cuối cùng trong danh sách
      const lastMessage = message[message.length - 1];
      const nextCursor = lastMessage ? lastMessage._id.toString() : null;

      const total = await Message.countDocuments({
        conversationId,
        isDeleted: false
      });

      return {
        success: true,
        message: "Lấy tin nhắn thành công",
        data: {
          messages: message, // Keep descending order (Newest -> Oldest)
          nextCursor: nextCursor,
          hasMore,
          total
        }
      };
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
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
  static async markAsRead(
    messageId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<MessageResponse> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          success: false,
          message: "Tin nhắn không tồn tại"
        };
      }

      // Chỉ receiver mới có thể đánh dấu đã đọc
      if (!message.receiverId || message.receiverId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền đánh dấu tin nhắn này"
        };
      }

      if (message.status === MessageStatus.READ) {
        return {
          success: true,
          message: "Tin nhắn đã được đọc trước đó",
          data: message
        };
      }

      message.status = MessageStatus.READ;
      message.readAt = new Date();
      await message.save();

      return {
        success: true,
        message: "Đã đánh dấu tin nhắn đã đọc",
        data: message
      };
    } catch (error) {
      console.error("Lỗi đánh dấu tin nhắn:", error);
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
  static async markAllAsRead(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<MessageResponse> {
    try {
      const result = await Message.updateMany(
        {
          conversationId,
          receiverId: userId,
          status: { $ne: MessageStatus.READ }
        },
        {
          status: MessageStatus.READ,
          readAt: new Date()
        }
      );

      // Reset unread count trong conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId.toString()}`]: 0
      });

      return {
        success: true,
        message: `Đã đánh dấu ${result.modifiedCount} tin nhắn đã đọc`,
        data: { count: result.modifiedCount }
      };
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả tin nhắn:", error);
      return {
        success: false,
        message: "Lỗi đánh dấu tất cả tin nhắn",
        error
      };
    }
  }

  /**
   * Xóa tin nhắn (soft delete)
   */
  static async deleteMessage(
    messageId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<MessageResponse> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          success: false,
          message: "Tin nhắn không tồn tại"
        };
      }

      // Chỉ người gửi mới có thể xóa
      if (message.senderId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền xóa tin nhắn này"
        };
      }

      const conversationId = message.conversationId;

      // Soft delete message
      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      // ✅ Cập nhật lastMessage trong conversation
      // Tìm tin nhắn gần nhất chưa bị xóa
      const latestMessage = await Message.findOne({
        conversationId,
        isDeleted: false
      })
        .sort({ createdAt: -1 })
        .populate('senderId', 'username displayName avatarUrl');

      if (latestMessage) {
        // Còn tin nhắn → Cập nhật lastMessage thành tin nhắn gần nhất
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: latestMessage.content,
            senderId: latestMessage.senderId,
            sentAt: latestMessage.createdAt,
            type: latestMessage.type
          }
        });
      } else {
        // Không còn tin nhắn nào → Xóa lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          $unset: { lastMessage: "" }
        });
      }

      return {
        success: true,
        message: "Đã xóa tin nhắn",
        data: message
      };
    } catch (error) {
      console.error("Lỗi xóa tin nhắn:", error);
      return {
        success: false,
        message: "Lỗi xóa tin nhắn",
        error
      };
    }
  }

  /**
   * Lấy số lượng tin nhắn chưa đọc
   */
  static async getUnreadCount(
    userId: Types.ObjectId,
    conversationId?: Types.ObjectId
  ): Promise<MessageResponse> {
    try {
      const count = await (Message as any).countUnreadMessages(userId, conversationId);

      return {
        success: true,
        message: "Lấy số lượng tin nhắn chưa đọc thành công",
        data: { count }
      };
    } catch (error) {
      console.error("Lỗi lấy số lượng tin nhắn chưa đọc:", error);
      return {
        success: false,
        message: "Lỗi lấy số lượng tin nhắn chưa đọc",
        error
      };
    }
  }

  /**
   * Chỉnh sửa tin nhắn
   */
  static async editMessage(
    messageId: Types.ObjectId,
    userId: Types.ObjectId,
    newContent: string
  ): Promise<MessageResponse> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return {
          success: false,
          message: "Tin nhắn không tồn tại"
        };
      }

      // Chỉ người gửi mới có thể chỉnh sửa
      if (message.senderId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền chỉnh sửa tin nhắn này"
        };
      }

      if (!newContent || newContent.trim().length === 0) {
        return {
          success: false,
          message: "Nội dung tin nhắn không được để trống"
        };
      }

      message.content = newContent.trim();
      message.isEdited = true;
      await message.save();

      const populatedMessage = await Message.findById(messageId)
        .populate('senderId', 'username displayName avatarUrl firstName lastName')
        .populate('receiverId', 'username displayName avatarUrl firstName lastName');

      return {
        success: true,
        message: "Đã chỉnh sửa tin nhắn",
        data: populatedMessage
      };
    } catch (error) {
      console.error("Lỗi chỉnh sửa tin nhắn:", error);
      return {
        success: false,
        message: "Lỗi chỉnh sửa tin nhắn",
        error
      };
    }
  }
}
