"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = void 0;
const registerFriendRequestHandler_1 = require("./registerFriendRequestHandler");
const registerMessageHandler_1 = require("./registerMessageHandler");
const registerConversationHandler_1 = require("./registerConversationHandler");
const onlineUsers = [];
//đăng ký các socket handlers cho socket.io
const registerSocketHandlers = (io) => {
    io.on("connection", async (socket) => {
        // ✅ userId đã được set bởi socketAuthMiddleware
        const userId = socket.data.userId;
        console.log(`🟢 User connected: ${socket.id} | UserId: ${userId || 'UNKNOWN'}`);
        // ✅ Đăng ký friend request handlers Ở CONNECTION LEVEL (1 lần per connection)
        (0, registerFriendRequestHandler_1.registerFriendRequestHandler)(io, socket, onlineUsers);
        // ✅ Đăng ký message handlers Ở CONNECTION LEVEL (1 lần per connection)
        (0, registerMessageHandler_1.registerMessageHandler)(io, socket, onlineUsers);
        // ✅ Đăng ký conversation handlers Ở CONNECTION LEVEL (1 lần per connection)
        (0, registerConversationHandler_1.registerConversationHandler)(io, socket, onlineUsers);
        //xử lý GET_ONLINE_USERS request - ĐẶT Ở CONNECTION LEVEL
        socket.on("GET_ONLINE_USERS", () => {
            socket.emit("ONLINE_USERS_LIST", {
                data: onlineUsers.map((u) => u.userId),
                count: onlineUsers.length
            });
        });
        //Khi người dùng đăng nhập ==> gán socketId cho user
        socket.on("user:online", async (userId) => {
            try {
                // ✅ Validate userId from event matches authenticated userId
                if (userId !== socket.data.userId) {
                    console.warn(`⚠️ userId mismatch: event=${userId}, authenticated=${socket.data.userId}`);
                    return;
                }
                if (!onlineUsers.some((u) => u.userId === userId)) {
                    onlineUsers.push({ userId, socketId: socket.id });
                    console.log("👥 User registered online:", userId);
                    console.log("👥 Total online users:", onlineUsers.length);
                    // Broadcast danh sách online users cho tất cả clients
                    io.emit("ONLINE_USERS_LIST", {
                        data: onlineUsers.map((u) => u.userId),
                        count: onlineUsers.length
                    });
                }
                else {
                    console.log("⚠️ User already registered:", userId);
                }
            }
            catch (error) {
                console.error("Lỗi kết nối:", error);
                socket.disconnect();
            }
        });
        //xử lý disconnect - ĐẶT Ở CONNECTION LEVEL (ngoài user:online)
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
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
//# sourceMappingURL=registerSocketHandlers.js.map