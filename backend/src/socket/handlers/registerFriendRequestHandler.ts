import { Server, Socket } from "socket.io";
import { FriendService } from "../../services/friendService";

interface OnlineUser {
  userId: string;
  socketId: string;
}

export const registerFriendRequestHandler = (
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUser[]
) => {
  // 📨 Gửi lời mời kết bạn
  socket.on(
    "SEND_FRIEND_REQUEST",
    async (data: { 
      toUserId?: string; 
      toUsername?: string; 
      message?: string 
    }) => {
      const { toUserId, toUsername, message } = data;
      
      // ✅ Lấy userId trực tiếp từ socket.data
      const fromUserId = socket.data.userId;
      if (!fromUserId) {
        socket.emit("FRIEND_REQUEST_ERROR", { 
          success: false,
          message: "Người dùng chưa được xác thực." 
        });
        return;
      }
      
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
    async (data: { requestId: string; response: "accepted" | "declined" }) => {
      try {
        const { requestId, response } = data;

        // ✅ Lấy userId trực tiếp từ socket.data
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("RESPOND_FRIEND_REQUEST_ERROR", {
            success: false,
            message: "Người dùng chưa được xác thực."
          });
          return;
        }

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

          // ✅ Phản hồi cho chính người xử lý (client 2)
          socket.emit("RESPOND_FRIEND_REQUEST_SUCCESS", {
            success: true,
            requestId,
            response,
            message: result.message,
            data: result.data
          });

          // 🔄 Emit event để client 2 cập nhật UI ngay lập tức
          socket.emit("FRIEND_REQUEST_PROCESSED", {
            requestId,
            response,
            message: response === "accepted" ? 
              "Bạn đã chấp nhận lời mời kết bạn!" : 
              "Bạn đã từ chối lời mời kết bạn!",
            data: result.data
          });
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
    async (data: { requestId: string }) => {
      try {
        const { requestId } = data;

        // ✅ Lấy userId trực tiếp từ socket.data
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("CANCEL_FRIEND_REQUEST_ERROR", {
            success: false,
            message: "Người dùng chưa được xác thực."
          });
          return;
        }

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
    async () => {
      try {
        // ✅ Lấy userId trực tiếp từ socket.data
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("FRIEND_REQUESTS_LIST", {
            success: false,
            message: "Người dùng chưa được xác thực."
          });
          return;
        }
        
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
    async () => {
      try {
        // ✅ Lấy userId trực tiếp từ socket.data
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("FRIENDS_LIST", {
            success: false,
            message: "Người dùng chưa được xác thực."
          });
          return;
        }
        
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

  // 🗑️ Xử lý xóa bạn bè
  socket.on(
    "REMOVE_FRIEND",
    async (data: { friendId: string }) => {
      try {
        const { friendId } = data;

        // ✅ Lấy userId trực tiếp từ socket.data
        const userId = socket.data.userId;
        if (!userId) {
          socket.emit("REMOVE_FRIEND_ERROR", {
            success: false,
            message: "Người dùng chưa được xác thực."
          });
          return;
        }

        const result = await FriendService.removeFriend(userId, friendId);

        if (result.success) {
          // 📤 Thông báo cho người bạn bị xóa nếu họ đang online
          const removedFriend = onlineUsers.find(
            (u) => u.userId === friendId.toString()
          );
          
          if (removedFriend) {
            io.to(removedFriend.socketId).emit("FRIEND_REMOVED", {
              fromUserId: userId,
              message: `${result.data?.removedFriend?.displayName || 'Một người bạn'} đã xóa bạn khỏi danh sách bạn bè.`,
              removedBy: {
                _id: userId,
                displayName: result.data?.removedFriend?.displayName || 'Unknown'
              }
            });
          }

          // ✅ Xác nhận cho người thực hiện xóa
          socket.emit("REMOVE_FRIEND_SUCCESS", {
            success: true,
            message: result.message,
            data: result.data
          });

        } else {
          socket.emit("REMOVE_FRIEND_ERROR", {
            success: false,
            message: result.message
          });
        }

      } catch (error) {
        console.error("Lỗi xóa bạn bè:", error);
        socket.emit("REMOVE_FRIEND_ERROR", {
          success: false,
          message: "Không thể xóa bạn bè."
        });
      }
    }
  );
};
