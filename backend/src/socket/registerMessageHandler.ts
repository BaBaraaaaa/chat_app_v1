import { Server, Socket } from "socket.io";
import { MessageController } from "../controllers/messageController";
import { ConversationController } from "../controllers/conversationController";
import { MessageType } from "../models/Message";
import { Types } from "mongoose";
import { FriendshipValidator } from "../utils/friendshipValidator";

interface OnlineUser {
  userId: string;
  socketId: string;
}

/**
 * Đăng ký các Socket handlers cho Message system
 */
export const registerMessageHandler = (
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUser[]
) => {
  const messageController = new MessageController();
  const conversationController = new ConversationController();

  // 📨 Gửi tin nhắn
  socket.on("SEND_MESSAGE", async (data: {
    conversationId: string;
    receiverId: string;
    content: string;
    type?: MessageType;
    attachments?: any[];
    replyTo?: string;
  }) => {
    try {
      const senderId = socket.data.userId;
      if (!senderId) {
        socket.emit("MESSAGE_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { conversationId, receiverId, content, type, attachments, replyTo } = data;

      // ✅ Validate: Chỉ cho phép nhắn tin giữa bạn bè
      try {
        await FriendshipValidator.validateFriendship(senderId, receiverId);
      } catch (error: any) {
        socket.emit("MESSAGE_ERROR", {
          success: false,
          message: error.message || "Bạn chỉ có thể nhắn tin với người trong danh sách bạn bè"
        });
        return;
      }

      // Gửi tin nhắn qua controller
      const result = await messageController.sendMessage({
        conversationId: new Types.ObjectId(conversationId),
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        content,
        ...(type && { type }),
        ...(attachments && { attachments }),
        ...(replyTo && { replyTo: new Types.ObjectId(replyTo) })
      });

      if (result.success) {
        const roomName = `conversation_${conversationId}`;
        
        // ✅ Log để debug
        
        // ✅ Broadcast NEW_MESSAGE cho TẤT CẢ clients trong conversation room
        io.to(roomName).emit("NEW_MESSAGE", {
          message: result.data,
          conversationId
        });

        // ✅ Gửi notification cho TẤT CẢ participants ngay cả khi chưa join room
        try {
          const conversationResult = await conversationController.getConversationById(
            conversationId,
            senderId
          );
          
          if (conversationResult.success && conversationResult.data?.participants) {
            for (const participant of conversationResult.data.participants) {
              const participantId = participant._id?.toString();
              
              if (participantId && participantId !== senderId) {
                const participantSocket = onlineUsers.find(u => u.userId === participantId);
                
                if (participantSocket) {
                  // ✅ Safe way to get unreadCount
                  let unreadCount = 0;
                  if (conversationResult.data.unreadCount) {
                    if (typeof conversationResult.data.unreadCount.get === 'function') {
                      // It's a Map
                      unreadCount = (conversationResult.data.unreadCount.get(participantId) || 0) + 1;
                    } else if (typeof conversationResult.data.unreadCount === 'object') {
                      // It's an object
                      unreadCount = (conversationResult.data.unreadCount[participantId] || 0) + 1;
                    }
                  } else {
                    unreadCount = 1; // First unread message
                  }
                  
                  io.to(participantSocket.socketId).emit("NEW_MESSAGE_NOTIFICATION", {
                    message: result.data,
                    conversation: conversationResult.data,
                    unreadCount: unreadCount,
                    from: 'notification'
                  });
                }
              }
            }
          }
        } catch (error) {
          // Silent error handling for notifications
        }

        socket.emit("MESSAGE_SENT", {
          success: true,
          message: result.message,
          data: result.data
        });
      } else {
        socket.emit("MESSAGE_ERROR", {
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      socket.emit("MESSAGE_ERROR", {
        success: false,
        message: "Không thể gửi tin nhắn."
      });
    }
  });

  // 📥 Lấy danh sách tin nhắn
  socket.on("GET_MESSAGES", async (data: {
    conversationId: string;
    limit?: number;
    skip?: number;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("MESSAGES_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { conversationId, limit = 50, skip = 0 } = data;

      const result = await messageController.getMessages(
        conversationId,
        userId,
        limit,
        skip
      );

      socket.emit("MESSAGES_LIST", result);

    } catch (error) {
      console.error("Lỗi lấy tin nhắn qua socket:", error);
      socket.emit("MESSAGES_ERROR", {
        success: false,
        message: "Không thể lấy danh sách tin nhắn."
      });
    }
  });

  // ✅ Đánh dấu tin nhắn đã đọc
  socket.on("MARK_MESSAGE_READ", async (data: {
    messageId: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("MARK_READ_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { messageId } = data;

      const result = await messageController.markAsRead(messageId, userId);

      if (result.success) {
        socket.emit("MARK_READ_SUCCESS", result);

        // 📤 Thông báo cho người gửi rằng tin nhắn đã được đọc
        const message = result.data;
        if (message && message.senderId) {
          const senderId = message.senderId._id || message.senderId;
          const sender = onlineUsers.find(u => u.userId === senderId.toString());
          
          if (sender) {
            io.to(sender.socketId).emit("MESSAGE_READ", {
              messageId,
              readBy: userId,
              readAt: message.readAt
            });
          }
        }
      } else {
        socket.emit("MARK_READ_ERROR", result);
      }
    } catch (error) {
      console.error("Lỗi đánh dấu tin nhắn qua socket:", error);
      socket.emit("MARK_READ_ERROR", {
        success: false,
        message: "Không thể đánh dấu tin nhắn đã đọc."
      });
    }
  });

  // ✅ Đánh dấu tất cả tin nhắn trong conversation đã đọc
  socket.on("MARK_ALL_READ", async (data: {
    conversationId: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("MARK_ALL_READ_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { conversationId } = data;

      const result = await messageController.markAllAsRead(conversationId, userId);

      if (result.success) {
        socket.emit("MARK_ALL_READ_SUCCESS", result);
      } else {
        socket.emit("MARK_ALL_READ_ERROR", result);
      }
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả tin nhắn qua socket:", error);
      socket.emit("MARK_ALL_READ_ERROR", {
        success: false,
        message: "Không thể đánh dấu tất cả tin nhắn đã đọc."
      });
    }
  });

  // 🗑️ Xóa tin nhắn
  socket.on("DELETE_MESSAGE", async (data: {
    messageId: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("DELETE_MESSAGE_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { messageId } = data;

      const result = await messageController.deleteMessage(messageId, userId);

      if (result.success) {
        socket.emit("DELETE_MESSAGE_SUCCESS", result);
        
        // 📤 Thông báo cho các participants khác trong conversation
        const message = result.data;
        if (message && message.conversationId) {
          const roomName = `conversation_${message.conversationId}`;
          
          // Emit MESSAGE_DELETED event
          socket.to(roomName).emit("MESSAGE_DELETED", {
            messageId,
            conversationId: message.conversationId
          });

          // ✅ Lấy conversation đã cập nhật để gửi thông tin lastMessage mới
          const updatedConversation = await conversationController.getConversationById(
            message.conversationId,
            userId
          );

          if (updatedConversation.success && updatedConversation.data) {
            // Emit CONVERSATION_UPDATED để cập nhật lastMessage mới
            io.to(roomName).emit("CONVERSATION_UPDATED", {
              conversationId: message.conversationId,
              updates: {
                lastMessage: updatedConversation.data.lastMessage || null,
                updatedAt: updatedConversation.data.updatedAt
              }
            });
          }
        }

      } else {
        socket.emit("DELETE_MESSAGE_ERROR", result);
      }
    } catch (error) {
      socket.emit("MESSAGE_ERROR", {
        success: false,
        message: "Không thể gửi tin nhắn."
      });
    }
  });

  // ✏️ Chỉnh sửa tin nhắn
  socket.on("EDIT_MESSAGE", async (data: {
    messageId: string;
    newContent: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("EDIT_MESSAGE_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { messageId, newContent } = data;

      const result = await messageController.editMessage(messageId, userId, newContent);

      if (result.success) {
        socket.emit("EDIT_MESSAGE_SUCCESS", result);
        
        // 📤 Thông báo cho các participants khác trong conversation
        const message = result.data;
        if (message && message.conversationId) {
          socket.to(`conversation_${message.conversationId}`).emit("MESSAGE_EDITED", {
            messageId,
            newContent,
            conversationId: message.conversationId,
            editedAt: new Date()
          });
        }

      } else {
        socket.emit("EDIT_MESSAGE_ERROR", result);
      }
    } catch (error) {
      console.error("Lỗi chỉnh sửa tin nhắn qua socket:", error);
      socket.emit("EDIT_MESSAGE_ERROR", {
        success: false,
        message: "Không thể chỉnh sửa tin nhắn."
      });
    }
  });

  // 💬 User đang gõ (typing indicator)
  socket.on("TYPING_START", (data: {
    conversationId: string;
    receiverId: string;
  }) => {
    const { conversationId, receiverId } = data;
    const userId = socket.data.userId;

    if (userId) {
      const recipient = onlineUsers.find(u => u.userId === receiverId);
      if (recipient) {
        io.to(recipient.socketId).emit("USER_TYPING", {
          conversationId,
          userId,
          isTyping: true
        });
      }
    }
  });

  socket.on("TYPING_STOP", (data: {
    conversationId: string;
    receiverId: string;
  }) => {
    const { conversationId, receiverId } = data;
    const userId = socket.data.userId;

    if (userId) {
      const recipient = onlineUsers.find(u => u.userId === receiverId);
      if (recipient) {
        io.to(recipient.socketId).emit("USER_TYPING", {
          conversationId,
          userId,
          isTyping: false
        });
      }
    }
  });

  // 📊 Lấy số lượng tin nhắn chưa đọc
  socket.on("GET_UNREAD_COUNT", async (data?: {
    conversationId?: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("UNREAD_COUNT_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const result = await messageController.getUnreadCount(
        userId,
        data?.conversationId
      );

      socket.emit("UNREAD_COUNT", result);
    } catch (error) {
      console.error("Lỗi lấy unread count qua socket:", error);
      socket.emit("UNREAD_COUNT_ERROR", {
        success: false,
        message: "Không thể lấy số lượng tin nhắn chưa đọc."
      });
    }
  });

  // 🔗 Join conversation room (để nhận real-time updates)
  socket.on("JOIN_CONVERSATION", (data: {
    conversationId: string;
  }) => {
    const { conversationId } = data;
    socket.join(`conversation_${conversationId}`);
  });

  // 🚪 Leave conversation room
  socket.on("LEAVE_CONVERSATION", (data: {
    conversationId: string;
  }) => {
    const { conversationId } = data;
    socket.leave(`conversation_${conversationId}`);
  });
};
