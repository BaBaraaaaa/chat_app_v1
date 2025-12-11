"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    io;
    onlineUsers;
    constructor(io, onlineUsers) {
        this.io = io;
        this.onlineUsers = onlineUsers;
    }
    // Gửi thông báo cho một user cụ thể
    sendToUser(userId, event, data) {
        const user = this.onlineUsers.find(u => u.userId === userId);
        if (user) {
            this.io.to(user.socketId).emit(event, data);
            return true;
        }
        return false;
    }
    // Thông báo lời mời kết bạn mới
    sendFriendRequestNotification(notification) {
        return this.sendToUser(notification.toUserId, "RECEIVE_FRIEND_REQUEST", {
            type: notification.type,
            request: notification.data,
            message: notification.message,
            timestamp: notification.timestamp
        });
    }
    // Thông báo phản hồi lời mời kết bạn
    sendFriendResponseNotification(notification) {
        return this.sendToUser(notification.toUserId, "FRIEND_REQUEST_RESPONSE", {
            type: notification.type,
            requestId: notification.requestId,
            response: notification.type === "friend_accepted" ? "accepted" : "declined",
            responderId: notification.fromUserId,
            message: notification.message,
            data: notification.data,
            timestamp: notification.timestamp
        });
    }
    // Thông báo hủy lời mời kết bạn
    sendFriendCancelNotification(notification) {
        return this.sendToUser(notification.toUserId, "FRIEND_REQUEST_CANCELLED", {
            type: notification.type,
            requestId: notification.requestId,
            fromUserId: notification.fromUserId,
            message: notification.message,
            timestamp: notification.timestamp
        });
    }
    // Kiểm tra user có online không
    isUserOnline(userId) {
        return this.onlineUsers.some(u => u.userId === userId);
    }
    // Lấy danh sách users online
    getOnlineUsers() {
        return this.onlineUsers.map(u => u.userId);
    }
    // Gửi thông báo cho tất cả users online
    broadcastToOnlineUsers(event, data) {
        this.onlineUsers.forEach(user => {
            this.io.to(user.socketId).emit(event, data);
        });
    }
    // Gửi thông báo cho một nhóm users
    sendToMultipleUsers(userIds, event, data) {
        let sentCount = 0;
        userIds.forEach(userId => {
            if (this.sendToUser(userId, event, data)) {
                sentCount++;
            }
        });
        return sentCount;
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map