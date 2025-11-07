import { Server } from "socket.io";
import { FriendRequestNotification } from "../types/friendTypes";

interface OnlineUser {
  userId: string;
  socketId: string;
}

export class NotificationService {
  private io: Server;
  private onlineUsers: OnlineUser[];

  constructor(io: Server, onlineUsers: OnlineUser[]) {
    this.io = io;
    this.onlineUsers = onlineUsers;
  }

  // Gửi thông báo cho một user cụ thể
  private sendToUser(userId: string, event: string, data: any): boolean {
    const user = this.onlineUsers.find(u => u.userId === userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Thông báo lời mời kết bạn mới
  sendFriendRequestNotification(notification: FriendRequestNotification): boolean {
    return this.sendToUser(notification.toUserId, "RECEIVE_FRIEND_REQUEST", {
      type: notification.type,
      request: notification.data,
      message: notification.message,
      timestamp: notification.timestamp
    });
  }

  // Thông báo phản hồi lời mời kết bạn
  sendFriendResponseNotification(notification: FriendRequestNotification): boolean {
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
  sendFriendCancelNotification(notification: FriendRequestNotification): boolean {
    return this.sendToUser(notification.toUserId, "FRIEND_REQUEST_CANCELLED", {
      type: notification.type,
      requestId: notification.requestId,
      fromUserId: notification.fromUserId,
      message: notification.message,
      timestamp: notification.timestamp
    });
  }

  // Kiểm tra user có online không
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.some(u => u.userId === userId);
  }

  // Lấy danh sách users online
  getOnlineUsers(): string[] {
    return this.onlineUsers.map(u => u.userId);
  }

  // Gửi thông báo cho tất cả users online
  broadcastToOnlineUsers(event: string, data: any): void {
    this.onlineUsers.forEach(user => {
      this.io.to(user.socketId).emit(event, data);
    });
  }

  // Gửi thông báo cho một nhóm users
  sendToMultipleUsers(userIds: string[], event: string, data: any): number {
    let sentCount = 0;
    userIds.forEach(userId => {
      if (this.sendToUser(userId, event, data)) {
        sentCount++;
      }
    });
    return sentCount;
  }
}