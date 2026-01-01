import { Server, Socket } from "socket.io";
import { registerFriendRequestHandler } from "./handlers/registerFriendRequestHandler";
import { registerMessageHandler } from "./handlers/registerMessageHandler";
import { registerConversationHandler } from "./handlers/registerConversationHandler";

interface OnlineUser {
  userId: string;
  socketId: string;
}
const onlineUsers: OnlineUser[] = [];
//đăng ký các socket handlers cho socket.io
export const registerSocketHandlers = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    // ✅ userId đã được set bởi socketAuthMiddleware
    const userId = socket.data.userId;

    // ✅ Đăng ký friend request handlers Ở CONNECTION LEVEL (1 lần per connection)
    registerFriendRequestHandler(io, socket, onlineUsers);

    // ✅ Đăng ký message handlers Ở CONNECTION LEVEL (1 lần per connection)
    registerMessageHandler(io, socket, onlineUsers);

    // ✅ Đăng ký conversation handlers Ở CONNECTION LEVEL (1 lần per connection)
    registerConversationHandler(io, socket, onlineUsers);

    //xử lý GET_ONLINE_USERS request - ĐẶT Ở CONNECTION LEVEL
    socket.on("GET_ONLINE_USERS", () => {
      socket.emit("ONLINE_USERS_LIST", {
        data: onlineUsers.map((u) => u.userId),
        count: onlineUsers.length
      });
    });

    //Khi người dùng đăng nhập ==> gán socketId cho user
    socket.on("user:online", async (userId: string) => {
      try {
        // ✅ Validate userId from event matches authenticated userId
        if (userId !== socket.data.userId) {
          console.warn(`⚠️ userId mismatch: event=${userId}, authenticated=${socket.data.userId}`);
          return;
        }

        if (!onlineUsers.some((u) => u.userId === userId)) {
          onlineUsers.push({ userId, socketId: socket.id });
          
          
          // Broadcast danh sách online users cho tất cả clients
          io.emit("ONLINE_USERS_LIST", {
            data: onlineUsers.map((u) => u.userId),
            count: onlineUsers.length
          });
        } else {
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
        socket.disconnect();
      }
    });

    //xử lý disconnect - ĐẶT Ở CONNECTION LEVEL (ngoài user:online)
    socket.on("disconnect", () => {
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
  });
};
