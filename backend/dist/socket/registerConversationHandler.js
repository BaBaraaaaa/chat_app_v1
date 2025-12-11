"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConversationHandler = void 0;
const conversationController_1 = require("../controllers/conversationController");
/**
 * Đăng ký các Socket handlers cho Conversation system
 */
const registerConversationHandler = (io, socket, onlineUsers) => {
    const conversationController = new conversationController_1.ConversationController();
    console.log(`💬 Conversation handlers đã được đăng ký cho socket: ${socket.id}`);
    // 🆕 Tạo hoặc lấy conversation với user khác
    socket.on("GET_OR_CREATE_CONVERSATION", async (data) => {
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
            const result = await conversationController.getOrCreateDirectConversation(userId, otherUserId);
            if (result.success) {
                socket.emit("CONVERSATION_CREATED", result);
                // Join conversation room
                socket.join(`conversation_${result.data._id}`);
                console.log(`✅ Conversation created/retrieved between ${userId} and ${otherUserId}`);
            }
            else {
                socket.emit("CONVERSATION_ERROR", result);
            }
        }
        catch (error) {
            console.error("Lỗi tạo/lấy conversation qua socket:", error);
            socket.emit("CONVERSATION_ERROR", {
                success: false,
                message: "Không thể tạo/lấy cuộc hội thoại."
            });
        }
    });
    // 📋 Lấy danh sách conversations
    socket.on("GET_CONVERSATIONS", async () => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("CONVERSATIONS_ERROR", {
                    success: false,
                    message: " 2Người dùng chưa được xác thực."
                });
                return;
            }
            const result = await conversationController.getUserConversations(userId);
            socket.emit("CONVERSATIONS_LIST", result);
            console.log(`📬 Đã gửi ${result.data?.length || 0} conversations cho user ${userId}`);
        }
        catch (error) {
            console.error("Lỗi lấy danh sách conversations qua socket:", error);
            socket.emit("CONVERSATIONS_ERROR", {
                success: false,
                message: "Không thể lấy danh sách cuộc hội thoại."
            });
        }
    });
    // 🔍 Lấy chi tiết conversation
    socket.on("GET_CONVERSATION_DETAIL", async (data) => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("CONVERSATION_DETAIL_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực."
                });
                return;
            }
            const { conversationId } = data;
            const result = await conversationController.getConversationById(conversationId, userId);
            if (result.success) {
                socket.emit("CONVERSATION_DETAIL", result);
                // Join conversation room
                socket.join(`conversation_${conversationId}`);
            }
            else {
                socket.emit("CONVERSATION_DETAIL_ERROR", result);
            }
        }
        catch (error) {
            console.error("Lỗi lấy chi tiết conversation qua socket:", error);
            socket.emit("CONVERSATION_DETAIL_ERROR", {
                success: false,
                message: "Không thể lấy chi tiết cuộc hội thoại."
            });
        }
    });
    // 🔍 Tìm kiếm conversations
    socket.on("SEARCH_CONVERSATIONS", async (data) => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("SEARCH_CONVERSATIONS_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực."
                });
                return;
            }
            const { query } = data;
            const result = await conversationController.searchConversations(userId, query);
            socket.emit("SEARCH_CONVERSATIONS_RESULT", result);
            console.log(`🔍 User ${userId} tìm kiếm: "${query}" - Tìm thấy ${result.data?.length || 0} kết quả`);
        }
        catch (error) {
            console.error("Lỗi tìm kiếm conversations qua socket:", error);
            socket.emit("SEARCH_CONVERSATIONS_ERROR", {
                success: false,
                message: "Không thể tìm kiếm cuộc hội thoại."
            });
        }
    });
    // 🗑️ Xóa conversation
    socket.on("DELETE_CONVERSATION", async (data) => {
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
            const result = await conversationController.deleteConversation(conversationId, userId);
            if (result.success) {
                socket.emit("DELETE_CONVERSATION_SUCCESS", result);
                // Leave conversation room
                socket.leave(`conversation_${conversationId}`);
                console.log(`🗑️ User ${userId} đã xóa conversation ${conversationId}`);
            }
            else {
                socket.emit("DELETE_CONVERSATION_ERROR", result);
            }
        }
        catch (error) {
            console.error("Lỗi xóa conversation qua socket:", error);
            socket.emit("DELETE_CONVERSATION_ERROR", {
                success: false,
                message: "Không thể xóa cuộc hội thoại."
            });
        }
    });
    // 📊 Lấy tổng số tin nhắn chưa đọc (tất cả conversations)
    socket.on("GET_TOTAL_UNREAD_COUNT", async () => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("TOTAL_UNREAD_COUNT_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực."
                });
                return;
            }
            const result = await conversationController.getTotalUnreadCount(userId);
            socket.emit("TOTAL_UNREAD_COUNT", result);
            console.log(`📊 User ${userId} có ${result.data?.totalUnread || 0} tin nhắn chưa đọc`);
        }
        catch (error) {
            console.error("Lỗi lấy tổng unread count qua socket:", error);
            socket.emit("TOTAL_UNREAD_COUNT_ERROR", {
                success: false,
                message: "Không thể lấy tổng số tin nhắn chưa đọc."
            });
        }
    });
    // ✅ Reset unread count
    socket.on("RESET_UNREAD_COUNT", async (data) => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("RESET_UNREAD_COUNT_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực."
                });
                return;
            }
            const { conversationId } = data;
            const result = await conversationController.resetUnreadCount(conversationId, userId);
            if (result.success) {
                socket.emit("RESET_UNREAD_COUNT_SUCCESS", result);
                console.log(`✅ Reset unread count cho user ${userId} trong conversation ${conversationId}`);
            }
            else {
                socket.emit("RESET_UNREAD_COUNT_ERROR", result);
            }
        }
        catch (error) {
            console.error("Lỗi reset unread count qua socket:", error);
            socket.emit("RESET_UNREAD_COUNT_ERROR", {
                success: false,
                message: "Không thể reset unread count."
            });
        }
    });
};
exports.registerConversationHandler = registerConversationHandler;
//# sourceMappingURL=registerConversationHandler.js.map