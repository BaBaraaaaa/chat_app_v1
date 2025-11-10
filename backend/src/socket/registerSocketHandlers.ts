import { Server, Socket } from "socket.io";
import FriendRequest, { FriendRequestStatus } from "../models/Friends";
import { registerFriendRequestHandler } from "./registerFriendRequestHandler";
interface OnlineUser {
  userId: string;
  socketId: string;
}
const onlineUsers: OnlineUser[] = [];
//đăng ký các socket handlers cho socket.io
export const registerSocketHandlers = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    console.log("🟢 User connected:", socket.id);

    //Khi người dùng đăng nhập ==> gán socketId cho user
    socket.on("user:online", async (userId: string) => {
      try {
        if (!onlineUsers.some((u) => u.userId === userId)) {
          onlineUsers.push({ userId, socketId: socket.id });
        }
        console.log(
          "👥 Online users:",
          onlineUsers.map((u) => u.userId)
        );
        
        // Broadcast danh sách online users cho tất cả clients
        io.emit("ONLINE_USERS_LIST", {
          data: onlineUsers.map((u) => u.userId),
          count: onlineUsers.length
        });
        
        //xử lý lời mời kết bạn đến
        registerFriendRequestHandler(io, socket, onlineUsers);

        //xử lý GET_ONLINE_USERS request
        socket.on("GET_ONLINE_USERS", () => {
          socket.emit("ONLINE_USERS_LIST", {
            data: onlineUsers.map((u) => u.userId),
            count: onlineUsers.length
          });
        });

        //xử lý disconnect
        socket.on("disconnect", () => {
          console.log("🔴 User disconnected:", socket.id);
          const index = onlineUsers.findIndex((u) => u.socketId === socket.id);
          if (index !== -1) {
            onlineUsers.splice(index, 1);
            
            // Broadcast updated online users list sau khi user disconnect
            io.emit("ONLINE_USERS_LIST", {
              data: onlineUsers.map((u) => u.userId),
              count: onlineUsers.length
            });
          }
        });
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        socket.disconnect();
      }
    });
  });
};
