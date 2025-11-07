import { Server, Socket } from "socket.io";
import { FriendService } from "../services/friendService";
import { NotificationService } from "../services/notificationService";
import { FriendRequestNotification } from "../types/friendTypes";

interface OnlineUser {
  userId: string;
  socketId: string;
}

export const registerFriendRequestHandler = (
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUser[]
) => {
  // Khởi tạo notification service
  const notificationService = new NotificationService(io, onlineUsers);
  // 📨 Gửi lời mời kết bạn
  socket.on(
    "SEND_FRIEND_REQUEST",
    async (data: { 
      toUserId?: string; 
      toUsername?: string; 
      fromUserId: string; 
      message?: string 
    }) => {
      const { toUserId, toUsername, fromUserId, message } = data;
      
      try {
        // Sử dụng FriendService để gửi lời mời
        const result = await FriendService.sendFriendRequest({
          fromUserId,
          toUserId: toUserId || undefined,
          toUsername: toUsername || undefined,
          message: message || undefined
        });

        if (result.success) {
          // 🔔 Thông báo cho người nhận nếu họ đang online
          const targetUserId = result.data?.toUserId?._id || result.data?.toUserId;
          const recipient = onlineUsers.find((u) => u.userId === targetUserId?.toString());
          
          if (recipient) {
            io.to(recipient.socketId).emit("RECEIVE_FRIEND_REQUEST", {
              request: result.data,
              message: "Bạn có lời mời kết bạn mới!"
            });
          }

          // ✅ Xác nhận lại cho người gửi
          socket.emit("FRIEND_REQUEST_SENT", {
            success: true,
            message: result.message,
            data: result.data
          });

          console.log(`✅ ${fromUserId} đã gửi lời mời kết bạn cho ${targetUserId}`);
        } else {
          // ❌ Thông báo lỗi cho người gửi
          socket.emit("FRIEND_REQUEST_ERROR", { 
            success: false,
            message: result.message,
            hasReverseRequest: result.hasReverseRequest 
          });
        }

      } catch (error) {
        console.error("Lỗi gửi lời mời kết bạn qua socket:", error);
        socket.emit("FRIEND_REQUEST_ERROR", { 
          success: false,
          message: "Không thể gửi lời mời kết bạn." 
        });
      }
    }
  );

  // ✅ Xử lý phản hồi lời mời kết bạn (chấp nhận/từ chối)
  socket.on(
    "RESPOND_FRIEND_REQUEST",
    async (data: { requestId: string; response: "accepted" | "declined"; userId: string }) => {
      try {
        const { requestId, response, userId } = data;

        let result;
        if (response === "accepted") {
          result = await FriendService.acceptFriendRequest(requestId, userId);
        } else {
          result = await FriendService.declineFriendRequest(requestId, userId);
        }

        if (result.success) {
          // 📤 Thông báo cho người gửi nếu họ đang online
          const fromUserId = result.data?.fromUserId?._id || result.data?.fromUserId;
          const sender = onlineUsers.find(
            (u) => u.userId === fromUserId?.toString()
          );
          
          if (sender) {
            io.to(sender.socketId).emit("FRIEND_REQUEST_RESPONSE", {
              requestId: result.data._id,
              response,
              responderId: userId,
              message: response === "accepted" ? 
                "Lời mời kết bạn của bạn đã được chấp nhận!" : 
                "Lời mời kết bạn của bạn đã bị từ chối.",
              data: result.data
            });
          }

          // � Phản hồi cho chính người xử lý
          socket.emit("RESPOND_FRIEND_REQUEST_SUCCESS", {
            success: true,
            requestId,
            response,
            message: result.message,
            data: result.data
          });

          console.log(
            `✅ ${userId} ${response === "accepted" ? "chấp nhận" : "từ chối"} lời mời của ${fromUserId}`
          );
        } else {
          socket.emit("RESPOND_FRIEND_REQUEST_ERROR", {
            success: false,
            message: result.message
          });
        }

      } catch (error) {
        console.error("Lỗi xử lý phản hồi lời mời kết bạn:", error);
        socket.emit("RESPOND_FRIEND_REQUEST_ERROR", {
          success: false,
          message: "Không thể xử lý phản hồi lời mời kết bạn."
        });
      }
    }
  );

  // 🗑️ Xử lý hủy lời mời kết bạn đã gửi
  socket.on(
    "CANCEL_FRIEND_REQUEST",
    async (data: { requestId: string; userId: string }) => {
      try {
        const { requestId, userId } = data;

        const result = await FriendService.cancelFriendRequest(requestId, userId);

        if (result.success) {
          // 📤 Thông báo cho người nhận nếu họ đang online  
          const toUserId = result.data?.toUserId?._id || result.data?.toUserId;
          const recipient = onlineUsers.find(
            (u) => u.userId === toUserId?.toString()
          );
          
          if (recipient) {
            io.to(recipient.socketId).emit("FRIEND_REQUEST_CANCELLED", {
              requestId: result.data._id,
              fromUserId: userId,
              message: "Một lời mời kết bạn đã bị hủy."
            });
          }

          // ✅ Xác nhận cho người hủy
          socket.emit("CANCEL_FRIEND_REQUEST_SUCCESS", {
            success: true,
            message: result.message,
            data: result.data
          });

          console.log(`🗑️ ${userId} đã hủy lời mời kết bạn ${requestId}`);
        } else {
          socket.emit("CANCEL_FRIEND_REQUEST_ERROR", {
            success: false,
            message: result.message
          });
        }

      } catch (error) {
        console.error("Lỗi hủy lời mời kết bạn:", error);
        socket.emit("CANCEL_FRIEND_REQUEST_ERROR", {
          success: false,
          message: "Không thể hủy lời mời kết bạn."
        });
      }
    }
  );

  // 📋 Lấy danh sách lời mời kết bạn
  socket.on(
    "GET_FRIEND_REQUESTS", 
    async (data: { userId: string }) => {
      try {
        const { userId } = data;
        const result = await FriendService.getFriendRequests(userId);

        socket.emit("FRIEND_REQUESTS_LIST", {
          success: result.success,
          message: result.message,
          data: result.data
        });

      } catch (error) {
        console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
        socket.emit("FRIEND_REQUESTS_LIST", {
          success: false,
          message: "Không thể lấy danh sách lời mời kết bạn."
        });
      }
    }
  );

  // 👥 Lấy danh sách bạn bè
  socket.on(
    "GET_FRIENDS_LIST", 
    async (data: { userId: string }) => {
      try {
        const { userId } = data;
        const result = await FriendService.getFriendsList(userId);

        socket.emit("FRIENDS_LIST", {
          success: result.success,
          message: result.message,
          data: result.data
        });

      } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
        socket.emit("FRIENDS_LIST", {
          success: false,
          message: "Không thể lấy danh sách bạn bè."
        });
      }
    }
  );

  // 📊 Lấy thống kê online users (dev purpose)
  socket.on("GET_ONLINE_USERS", () => {
    socket.emit("ONLINE_USERS_LIST", {
      success: true,
      data: notificationService.getOnlineUsers(),
      count: onlineUsers.length
    });
  });
};
