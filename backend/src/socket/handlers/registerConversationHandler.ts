import { Server, Socket } from "socket.io";
import { ConversationController } from "../../controllers/conversationController";

interface OnlineUser {
  userId: string;
  socketId: string;
}

/**
 * Đăng ký các Socket handlers cho Conversation system
 */
export const registerConversationHandler = (
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUser[]
) => {
  const conversationController = new ConversationController();


  // 🆕 Tạo hoặc lấy conversation với user khác
  socket.on("GET_OR_CREATE_CONVERSATION", async (data: {
    otherUserId: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("CONVERSATION_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực 1."
        });
        return;
      }

      const { otherUserId } = data;

      const result = await conversationController.getOrCreateDirectConversation(
        userId,
        otherUserId
      );

      if (result.success) {
        socket.emit("CONVERSATION_CREATED", result);

        // Join conversation room
        socket.join(`conversation_${result.data._id}`);

      } else {
        socket.emit("CONVERSATION_ERROR", result);
      }
    } catch (error) {
      console.error("Lỗi tạo/lấy conversation qua socket:", error);
      socket.emit("CONVERSATION_ERROR", {
        success: false,
        message: "Không thể tạo/lấy cuộc hội thoại."
      });
    }
  });





  // 🗑️ Xóa conversation
  socket.on("DELETE_CONVERSATION", async (data: {
    conversationId: string;
  }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("DELETE_CONVERSATION_ERROR", {
          success: false,
          message: "Người dùng chưa được xác thực."
        });
        return;
      }

      const { conversationId } = data;

      const result = await conversationController.deleteConversation(
        conversationId,
        userId
      );

      if (result.success) {
        socket.emit("DELETE_CONVERSATION_SUCCESS", result);

        // Leave conversation room
        socket.leave(`conversation_${conversationId}`);

      } else {
        socket.emit("DELETE_CONVERSATION_ERROR", result);
      }
    } catch (error) {
      console.error("Lỗi xóa conversation qua socket:", error);
      socket.emit("DELETE_CONVERSATION_ERROR", {
        success: false,
        message: "Không thể xóa cuộc hội thoại."
      });
    }
  });




};
