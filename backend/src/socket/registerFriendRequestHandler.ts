import { Server, Socket } from "socket.io";
import FriendRequest, { FriendRequestStatus } from "../models/Friends";
import User from "../models/User";

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
    async (data: { toUserId: string; fromUserId: string; message: string }) => {
      const { toUserId, fromUserId, message } = data;
      try {
        const newRequest = await FriendRequest.create({
          fromUserId,
          toUserId,
          message: message || "",
          status: FriendRequestStatus.PENDING,
        });

        // 🔔 Thông báo cho người nhận nếu họ đang online
        const recipient = onlineUsers.find((u) => u.userId === toUserId);
        if (recipient) {
          io.to(recipient.socketId).emit("RECEIVE_FRIEND_REQUEST", newRequest);
        }

        // ✅ Xác nhận lại cho người gửi
        socket.emit("FRIEND_REQUEST_SENT", newRequest);
      } catch (error) {
        console.error("Lỗi gửi lời mời kết bạn:", error);
        socket.emit("FRIEND_ERROR", { message: "Không thể gửi lời mời kết bạn." });
      }
    }
  );

  // ✅ Xử lý phản hồi lời mời kết bạn
  socket.on(
    "RESPOND_FRIEND_REQUEST",
    async (data: { requestId: string; response: "accepted" | "declined" }) => {
      try {
        const { requestId, response } = data;
        const request = await FriendRequest.findById(requestId);

        if (!request) {
          return socket.emit("RESPONSE_FRIEND_ERROR", {
            message: "Yêu cầu kết bạn không tồn tại.",
          });
        }

        // 🧩 Nếu đã xử lý rồi thì bỏ qua
        if (request.status !== FriendRequestStatus.PENDING) {
          return socket.emit("RESPONSE_FRIEND_ERROR", {
            message: "Yêu cầu này đã được xử lý.",
          });
        }

        // 🟢 Nếu được chấp nhận thì thêm bạn
        if (response === "accepted") {
          await Promise.all([
            User.findByIdAndUpdate(request.fromUserId, {
              $addToSet: { friends: request.toUserId },
            }),
            User.findByIdAndUpdate(request.toUserId, {
              $addToSet: { friends: request.fromUserId },
            }),
          ]);
        }

        // ⚙️ Cập nhật trạng thái request
        request.status =
          response === "accepted"
            ? FriendRequestStatus.ACCEPTED
            : FriendRequestStatus.DECLINED;
        await request.save();

        // 📤 Thông báo cho người gửi
        const sender = onlineUsers.find(
          (u) => u.userId === request.fromUserId.toString()
        );
        if (sender) {
          io.to(sender.socketId).emit("FRIEND_REQUEST_RESPONSE", {
            requestId: request._id,
            response,
            responderId: request.toUserId,
          });
        }

        // 📥 Phản hồi cho chính người xử lý
        socket.emit("RESPOND_FRIEND_REQUEST_SUCCESS", {
          requestId,
          response,
        });

        console.log(
          `✅ ${request.toUserId} ${response} lời mời của ${request.fromUserId}`
        );
      } catch (error) {
        console.error("Lỗi xử lý phản hồi lời mời kết bạn:", error);
        socket.emit("FRIEND_ERROR", {
          message: "Không thể xử lý phản hồi lời mời kết bạn.",
        });
      }
    }
  );
};
