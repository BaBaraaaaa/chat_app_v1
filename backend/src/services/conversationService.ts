import Conversation, { IConversation, ConversationType } from "../models/Conversation";
import Message from "../models/Message";
import User from "../models/User";
import { Types } from "mongoose";
import { MessageService } from "./messageService";
import { getIO } from "../libs/socket";

export interface ConversationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export class ConversationService {
  /**
   * Tạo cuộc hội thoại nhóm
   */
  static async createGroupConversation(
    adminId: Types.ObjectId,
    participantIds: Types.ObjectId[],
    name: string,
    avatarUrl?: string
  ): Promise<ConversationResponse> {
    try {
      if (participantIds.length < 2) {
        return {
          success: false,
          message: "Cần ít nhất 2 thành viên để tạo nhóm"
        };
      }

      const allParticipants = [adminId, ...participantIds];
      const uniqueParticipants = Array.from(new Set(allParticipants.map(id => id.toString())));

      // Initialize unread count map
      const unreadCountMap = new Map();
      uniqueParticipants.forEach(id => {
        unreadCountMap.set(id, 0);
      });

      const createdConversation = await Conversation.create({
        type: ConversationType.GROUP,
        participants: uniqueParticipants,
        adminId: adminId,
        name: name,
        avatarUrl: avatarUrl,
        unreadCount: unreadCountMap
      });

      const conversation = await Conversation.findById(createdConversation._id)
        .populate('participants', 'username displayName avatarUrl firstName lastName email');

      if (!conversation) {
        return {
          success: false,
          message: "Không thể tạo nhóm"
        };
      }

      // ✅ Transform unreadCount Map
      const convObj = conversation.toObject();
      const transformedConv = {
        ...convObj,
        unreadCount: 0 // New group has 0 unread
      };

      // 🔔 Notify all participants about the new conversation via Socket.IO
      try {
        const io = getIO();

        uniqueParticipants.forEach(participantId => {
          // Notify each participant in their personal room
          io.to(`user_${participantId}`).emit("NEW_CONVERSATION_NOTIFICATION", {
            conversation: transformedConv
          });
        });
      } catch (socketError) {
        console.error("⚠️ Error emitting socket notification for new group:", socketError);
      }

      return {
        success: true,
        message: "Tạo nhóm thành công",
        data: transformedConv
      };

    } catch (error) {
      console.error("Lỗi tạo group conversation:", error);
      return {
        success: false,
        message: "Lỗi tạo nhóm trò chuyện",
        error
      };
    }
  }

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

      // Tìm hoặc tạo conversation
      let conversation = await Conversation.findOne({
        type: ConversationType.DIRECT,
        participants: { $all: [userId1, userId2], $size: 2 }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: ConversationType.DIRECT,
          participants: [userId1, userId2],
          unreadCount: new Map([
            [userId1.toString(), 0],
            [userId2.toString(), 0]
          ]),
          hiddenBy: [],
          isActive: true
        });
      } else {
        // Nếu đã tồn tại, đảm bảo isActive = true và xóa user khỏi hiddenBy
        const needsUpdate = !conversation.isActive || (conversation.hiddenBy && conversation.hiddenBy.length > 0);
        if (needsUpdate) {
          await Conversation.findByIdAndUpdate(conversation._id, {
            $set: { isActive: true },
            $pull: { hiddenBy: { $in: [userId1, userId2] } }
          });
          // Fetch lại để có data mới nhất
          conversation = await Conversation.findById(conversation._id);
        }
      }

      if (!conversation) {
        return {
          success: false,
          message: "Không thể lấy cuộc hội thoại"
        };
      }

      // Populate data
      await conversation.populate([
        { path: 'participants', select: 'username displayName avatar firstName lastName email avatarUrl' },
        { path: 'lastMessage.senderId', select: 'username displayName avatarUrl' }
      ]);

      // ✅ Transform unreadCount Map thành số cho user hiện tại
      const convObj = conversation.toObject();
      const transformedConv = {
        ...convObj,
        unreadCount: conversation.unreadCount.get(userId1.toString()) || 0
      };

      return {
        success: true,
        message: "Lấy cuộc hội thoại thành công",
        data: transformedConv
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
        isActive: true,
        hiddenBy: { $ne: userId }
      })
        .populate('participants', 'username displayName avatarUrl firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatarUrl')
        .sort({ 'lastMessage.sentAt': -1 });

      // Thêm thông tin unread count và lọc lastMessage nếu đã bị user xóa lịch sử
      const conversationsWithMetadata = await Promise.all(conversations.map(async (conv) => {
        const convObj = conv.toObject();
        let lastMessage = convObj.lastMessage;

        // Nếu có lastMessage, kiểm tra xem user này đã xóa nó chưa
        if (lastMessage && lastMessage.messageId) {
          const isLastMessageDeletedByUser = await Message.exists({
            _id: lastMessage.messageId,
            deletedBy: userId
          });
          if (isLastMessageDeletedByUser) {
            lastMessage = undefined;
          }
        }

        return {
          ...convObj,
          lastMessage,
          unreadCount: conv.unreadCount.get(userId.toString()) || 0
        };
      }));

      return {
        success: true,
        message: "Lấy danh sách cuộc hội thoại thành công",
        data: conversationsWithMetadata
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
        .populate('participants', 'username displayName avatarUrl firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatarUrl');

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

      // Nếu conversation đang ẩn cho user này hoặc bị inactive, bỏ ẩn và reactivate
      const isHidden = conversation.hiddenBy && conversation.hiddenBy.some(id => id.toString() === userId.toString());
      if (isHidden || !conversation.isActive) {
        await Conversation.findByIdAndUpdate(conversationId, {
          $pull: { hiddenBy: userId },
          $set: { isActive: true }
        });
        // Fetch lại data mới nhất
        const updated = await Conversation.findById(conversationId)
          .populate('participants', 'username displayName avatarUrl firstName lastName email')
          .populate('lastMessage.senderId', 'username displayName avatarUrl');
        if (updated) {
          const convObj = updated.toObject();
          let lastMessage = convObj.lastMessage;
          if (lastMessage && lastMessage.messageId) {
            const isMsgDeleted = await Message.exists({ _id: lastMessage.messageId, deletedBy: userId });
            if (isMsgDeleted) lastMessage = undefined;
          }
          return {
            success: true,
            message: "Lấy chi tiết cuộc hội thoại thành công",
            data: {
              ...convObj,
              lastMessage,
              unreadCount: updated.unreadCount.get(userId.toString()) || 0
            }
          };
        }
      }

      const convObj = conversation.toObject();
      let lastMessage = convObj.lastMessage;
      if (lastMessage && lastMessage.messageId) {
        const isMsgDeleted = await Message.exists({ _id: lastMessage.messageId, deletedBy: userId });
        if (isMsgDeleted) lastMessage = undefined;
      }
      return {
        success: true,
        message: "Lấy chi tiết cuộc hội thoại thành công",
        data: {
          ...convObj,
          lastMessage,
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
        (p: any) => p.toString() === userId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          message: "Bạn không có quyền xóa cuộc hội thoại này"
        };
      }

      // Sử dụng MessageService để xóa lịch sử tin nhắn cho user này
      // và ẩn cuộc hội thoại
      await MessageService.clearConversationMessages(conversationId, userId);

      // Lấy lại data mới nhất để trả về
      const updated = await Conversation.findById(conversationId);
      if (!updated) {
        return { success: false, message: "Lỗi sau khi xóa cuộc hội thoại" };
      }

      // ✅ Transform unreadCount Map thành số cho user hiện tại
      const convObj = updated.toObject();
      const transformedConv = {
        ...convObj,
        unreadCount: updated.unreadCount.get(userId.toString()) || 0
      };

      return {
        success: true,
        message: "Đã xóa cuộc hội thoại",
        data: transformedConv
      };
    } catch (error) {
      console.error("Lỗi xóa cuộc hội thoại:", error);
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
        .populate('participants', 'username displayName avatarUrl firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatarUrl');

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
      // Tìm conversations mà user là participant và chưa bị ẩn bởi user này
      const conversations = await Conversation.find({
        participants: userId,
        isActive: true,
        hiddenBy: { $ne: userId }
      })
        .populate('participants', 'username displayName avatarUrl firstName lastName email')
        .populate('lastMessage.senderId', 'username displayName avatarUrl');

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

      // ✅ Transform unreadCount và lọc lastMessage nếu đã bị user xóa
      const searchResults = await Promise.all(filtered.map(async (conv) => {
        const convObj = conv.toObject();
        let lastMessage = convObj.lastMessage;

        // Nếu có lastMessage, kiểm tra xem user này đã xóa nó chưa
        if (lastMessage && lastMessage.messageId) {
          const isLastMessageDeletedByUser = await Message.exists({
            _id: lastMessage.messageId,
            deletedBy: userId
          });
          if (isLastMessageDeletedByUser) {
            lastMessage = undefined;
          }
        }

        // Sau khi lọc lastMessage, kiểm tra lại xem nó có còn thỏa mãn điều kiện search query không
        // (Nếu search kêt quả dựa trên content của lastMessage mà lastMessage bị ẩn thì bỏ qua)
        const matchParticipant = conv.participants.some((p: any) => {
          if (p._id.toString() === userId.toString()) return false;
          const fullName = `${p.displayName || ''} ${p.username || ''}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase());
        });
        const matchMessage = lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchParticipant && !matchMessage) return null;

        return {
          ...convObj,
          lastMessage,
          unreadCount: conv.unreadCount.get(userId.toString()) || 0
        };
      }));

      const finalConversations = searchResults.filter(c => c !== null);

      return {
        success: true,
        message: "Tìm kiếm cuộc hội thoại thành công",
        data: finalConversations
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
      messageId: Types.ObjectId;
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
            messageId: messageData.messageId,
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

  /**
   * Thêm thành viên vào nhóm
   */
  static async addParticipants(
    conversationId: Types.ObjectId,
    adminId: Types.ObjectId,
    participantIds: Types.ObjectId[]
  ): Promise<ConversationResponse> {
    try {
      if (participantIds.length === 0) {
        return {
          success: false,
          message: "Danh sách thành viên cần thêm trống"
        };
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { success: false, message: "Cuộc hội thoại không tồn tại" };
      }

      if (conversation.type !== ConversationType.GROUP) {
        return { success: false, message: "Chỉ có thể thêm thành viên vào nhóm" };
      }

      // Check if admin is the creator/admin of the group?
      // For now we allow any member to add? No, let's restrict to Admin for consisteny if adminId exists.
      // But if adminId field is optional in schema (though we added it), checking it is safer.
      if (conversation.adminId && conversation.adminId.toString() !== adminId.toString()) {
        return { success: false, message: "Chỉ quản trị viên mới có thể thêm thành viên" };
      }

      const currentParticipantIds = conversation.participants.map(p => p.toString());
      const newIds = participantIds
        .map(id => id.toString())
        .filter(id => !currentParticipantIds.includes(id));

      if (newIds.length === 0) {
        return { success: false, message: "Tất cả thành viên đã có trong nhóm" };
      }

      // Add new members
      newIds.forEach(id => {
        conversation.participants.push(new Types.ObjectId(id));
        conversation.unreadCount.set(id, 0); // Init unread count
      });

      await conversation.save();

      const updatedConv = await Conversation.findById(conversationId)
        .populate('participants', 'username displayName avatarUrl firstName lastName email');

      // Tạo tin nhắn hệ thống
      try {
        const addedUsers = await User.find({ _id: { $in: newIds } });
        const adminUser = await User.findById(adminId);
        if (addedUsers.length > 0 && adminUser) {
          const names = addedUsers.map(u => u.displayName || u.username).join(", ");
          const systemContent = `${adminUser.displayName || adminUser.username} đã thêm ${names} vào nhóm`;

          const systemMessage = await Message.create({
            conversationId,
            senderId: new Types.ObjectId("000000000000000000000000"),
            content: systemContent,
            type: "system",
            status: "sent"
          });

          // Cập nhật lastMessage
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
              messageId: systemMessage._id,
              content: systemContent,
              senderId: new Types.ObjectId("000000000000000000000000"),
              sentAt: new Date(),
              type: "system"
            }
          });

          // 🔔 Emit notifications via Socket.IO
          try {
            const io = getIO();

            // 1. Broadcast system message to everyone in the room
            io.to(`conversation_${conversationId}`).emit("NEW_MESSAGE", {
              conversationId,
              message: await systemMessage.populate('senderId', 'username displayName avatarUrl')
            });

            // 2. Notify new members about the conversation
            addedUsers.forEach(user => {
              io.to(`user_${user._id}`).emit("NEW_CONVERSATION_NOTIFICATION", {
                conversation: updatedConv || conversation
              });
            });

            // 3. Notify existing members about new joiners
            io.to(`conversation_${conversationId}`).emit("GROUP_MEMBER_JOINED", {
              conversationId,
              newMembers: addedUsers,
              conversation: updatedConv, // Use 'conversation' to match frontend expectance
              message: systemContent
            });

            // 4. Notify ALL participants via MESSAGE_NOTIFICATION (for sidebar update)
            if (updatedConv && updatedConv.participants) {
              const populatedMessage = await systemMessage.populate('senderId', 'username displayName avatarUrl');
              updatedConv.participants.forEach((p: any) => {
                const pId = p._id.toString();
                io.to(`user_${pId}`).emit("NEW_MESSAGE_NOTIFICATION", {
                  message: populatedMessage,
                  conversation: updatedConv,
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0),
                  from: 'system'
                });

                io.to(`user_${pId}`).emit("UNREAD_COUNT_CHANGED", {
                  conversationId: conversationId.toString(),
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0)
                });
              });
            }
          } catch (socketError) {
            console.error("⚠️ Socket notification error in addParticipants:", socketError);
          }
        }
      } catch (sysErr) {
        console.error("Lỗi tạo tin nhắn hệ thống khi thêm thành viên:", sysErr);
      }

      return {
        success: true,
        message: "Đã thêm thành viên vào nhóm",
        data: updatedConv
      };

    } catch (error) {
      console.error("Lỗi thêm thành viên:", error);
      return { success: false, message: "Lỗi thêm thành viên", error };
    }
  }

  /**
   * Xóa thành viên khỏi nhóm
   */
  static async removeParticipant(
    conversationId: Types.ObjectId,
    adminId: Types.ObjectId,
    participantIdToRemove: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { success: false, message: "Cuộc hội thoại không tồn tại" };
      }

      if (conversation.type !== ConversationType.GROUP) {
        return { success: false, message: "Chức năng chỉ dành cho nhóm" };
      }

      if (conversation.adminId && conversation.adminId.toString() !== adminId.toString()) {
        return { success: false, message: "Chỉ quản trị viên mới có thể xóa thành viên" };
      }

      const strIdToRemove = participantIdToRemove.toString();
      if (!conversation.participants.some(p => p.toString() === strIdToRemove)) {
        return { success: false, message: "Thành viên không tồn tại trong nhóm" };
      }

      // Remove
      conversation.participants = conversation.participants.filter(p => p.toString() !== strIdToRemove) as Types.ObjectId[];
      conversation.unreadCount.delete(strIdToRemove);

      await conversation.save();

      const updatedConv = await Conversation.findById(conversationId)
        .populate('participants', 'username displayName avatarUrl firstName lastName email');

      // Tạo tin nhắn hệ thống
      try {
        const removedUser = await User.findById(participantIdToRemove);
        const adminUser = await User.findById(adminId);
        if (removedUser && adminUser) {
          const systemContent = `${adminUser.displayName || adminUser.username} đã xóa ${removedUser.displayName || removedUser.username} khỏi nhóm`;

          const systemMessage = await Message.create({
            conversationId,
            senderId: new Types.ObjectId("000000000000000000000000"),
            content: systemContent,
            type: "system",
            status: "sent"
          });

          // Cập nhật lastMessage
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
              messageId: systemMessage._id,
              content: systemContent,
              senderId: new Types.ObjectId("000000000000000000000000"),
              sentAt: new Date(),
              type: "system"
            }
          });

          // 🔔 Emit notifications via Socket.IO
          try {
            const io = getIO();

            // 1. Broadcast system message to everyone in the room
            io.to(`conversation_${conversationId}`).emit("NEW_MESSAGE", {
              conversationId,
              message: await systemMessage.populate('senderId', 'username displayName avatarUrl')
            });

            // 2. Notify the removed user
            io.to(`user_${participantIdToRemove}`).emit("GROUP_MEMBER_REMOVED", {
              conversationId: conversationId.toString(),
              message: "Bạn đã bị xóa khỏi nhóm",
              removedBy: adminId.toString()
            });

            // 3. Force removed user to leave the conversation room if they have an active socket
            const sockets = await io.in(`user_${participantIdToRemove}`).fetchSockets();
            sockets.forEach(s => {
              s.leave(`conversation_${conversationId}`);
            });

            // 4. Notify remaining members about the removal
            io.to(`conversation_${conversationId}`).emit("GROUP_MEMBER_REMOVED", {
              conversationId,
              participantId: participantIdToRemove,
              updatedConversation: updatedConv, // Send full updated conversation
              message: systemContent
            });

            // 5. Notify all remaining members via MESSAGE_NOTIFICATION (for sidebar update)
            if (updatedConv && updatedConv.participants) {
              const populatedMessage = await systemMessage.populate('senderId', 'username displayName avatarUrl');
              updatedConv.participants.forEach((p: any) => {
                const pId = p._id.toString();
                io.to(`user_${pId}`).emit("NEW_MESSAGE_NOTIFICATION", {
                  message: populatedMessage,
                  conversation: updatedConv,
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0),
                  from: 'system'
                });

                io.to(`user_${pId}`).emit("UNREAD_COUNT_CHANGED", {
                  conversationId: conversationId.toString(),
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0)
                });
              });
            }
          } catch (socketError) {
            console.error("⚠️ Socket notification error in removeParticipant:", socketError);
          }
        }
      } catch (sysErr) {
        console.error("Lỗi tạo tin nhắn hệ thống khi xóa thành viên:", sysErr);
      }

      return {
        success: true,
        message: "Đã xóa thành viên khỏi nhóm",
        data: updatedConv
      };
    } catch (error) {
      console.error("Lỗi xóa thành viên:", error);
      return { success: false, message: "Lỗi xóa thành viên", error };
    }
  }

  /**
   * Rời nhóm
   */
  static async leaveConversation(
    conversationId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { success: false, message: "Cuộc hội thoại không tồn tại" };
      }

      if (conversation.type !== ConversationType.GROUP) {
        return { success: false, message: "Chức năng chỉ dành cho nhóm" };
      }

      const strUserId = userId.toString();
      if (!conversation.participants.some(p => p.toString() === strUserId)) {
        return { success: false, message: "Bạn không phải thành viên của nhóm này" };
      }

      // If Admin leaves, pass admin to someone else? Or destroy group? 
      // For simplicity, if admin leaves, just remove them. 
      // Optionally assign new admin if participants > 0.
      if (conversation.adminId && conversation.adminId.toString() === strUserId) {
        // Auto-assign new admin (first participant)
        const remaining = conversation.participants.filter(p => p.toString() !== strUserId);
        if (remaining.length > 0 && remaining[0]) {
          conversation.adminId = remaining[0];
        } else {
          // No one left, maybe deactivate group?
          conversation.isActive = false;
        }
      }

      // Remove user
      conversation.participants = conversation.participants.filter(p => p.toString() !== strUserId) as Types.ObjectId[];
      conversation.unreadCount.delete(strUserId);

      await conversation.save();

      const updatedConv = await Conversation.findById(conversationId)
        .populate('participants', 'username displayName avatarUrl firstName lastName email');

      // Tạo tin nhắn hệ thống
      try {
        const leavingUser = await User.findById(userId);
        if (leavingUser) {
          const systemContent = `${leavingUser.displayName || leavingUser.username} đã rời khỏi nhóm`;

          const systemMessage = await Message.create({
            conversationId,
            senderId: new Types.ObjectId("000000000000000000000000"),
            content: systemContent,
            type: "system",
            status: "sent"
          });

          // Cập nhật lastMessage
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
              messageId: systemMessage._id,
              content: systemContent,
              senderId: new Types.ObjectId("000000000000000000000000"),
              sentAt: new Date(),
              type: "system"
            }
          });

          // 🔔 Emit notifications via Socket.IO
          try {
            const io = getIO();

            // 1. Broadcast system message to everyone in the room (including the leaving user if still connected)
            io.to(`conversation_${conversationId}`).emit("NEW_MESSAGE", {
              conversationId,
              message: await systemMessage.populate('senderId', 'username displayName avatarUrl')
            });

            // 2. Notify the room about the member leaving
            io.to(`conversation_${conversationId}`).emit("GROUP_MEMBER_LEFT", {
              conversationId: conversationId.toString(),
              userId: strUserId,
              updatedConversation: updatedConv, // Send full updated conversation
              message: systemContent
            });

            // 3. Notify remaining members via MESSAGE_NOTIFICATION (for sidebar update)
            if (updatedConv && updatedConv.participants) {
              const populatedMessage = await systemMessage.populate('senderId', 'username displayName avatarUrl');
              updatedConv.participants.forEach((p: any) => {
                const pId = p._id.toString();
                io.to(`user_${pId}`).emit("NEW_MESSAGE_NOTIFICATION", {
                  message: populatedMessage,
                  conversation: updatedConv,
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0),
                  from: 'system'
                });

                io.to(`user_${pId}`).emit("UNREAD_COUNT_CHANGED", {
                  conversationId: conversationId.toString(),
                  unreadCount: (updatedConv.unreadCount?.get(pId) || 0)
                });
              });
            }

            // 4. Force leaving user to leave the conversation room if they have an active socket
            const sockets = await io.in(`user_${strUserId}`).fetchSockets();
            sockets.forEach(s => {
              s.leave(`conversation_${conversationId}`);
            });
          } catch (socketError) {
            console.error("⚠️ Socket notification error in leaveConversation:", socketError);
          }
        }
      } catch (sysErr) {
        console.error("Lỗi tạo tin nhắn hệ thống khi rời cuộc hội thoại:", sysErr);
      }

      return {
        success: true,
        message: "Đã rời nhóm thành công",
        data: {
          conversation: updatedConv,
          userId: strUserId
        }
      };

    } catch (error) {
      console.error("Lỗi rời nhóm:", error);
      return { success: false, message: "Lỗi rời nhóm", error };
    }
  }

  /**
   * Cập nhật avatar của nhóm
   */
  static async updateGroupAvatar(
    conversationId: Types.ObjectId,
    adminId: Types.ObjectId,
    avatarUrl: string
  ): Promise<ConversationResponse> {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return { success: false, message: "Cuộc hội thoại không tồn tại" };
      }

      if (conversation.type !== ConversationType.GROUP) {
        return { success: false, message: "Chức năng chỉ dành cho nhóm" };
      }

      if (conversation.adminId && conversation.adminId.toString() !== adminId.toString()) {
        return { success: false, message: "Chỉ quản trị viên mới có thể thay đổi avatar" };
      }

      conversation.avatarUrl = avatarUrl;
      await conversation.save();

      const updatedConv = await Conversation.findById(conversationId)
        .populate('participants', 'username displayName avatarUrl firstName lastName email');

      return {
        success: true,
        message: "Đã cập nhật avatar nhóm",
        data: updatedConv
      };

    } catch (error) {
      console.error("Lỗi cập nhật avatar nhóm:", error);
      return { success: false, message: "Lỗi cập nhật avatar nhóm", error };
    }
  }
}
