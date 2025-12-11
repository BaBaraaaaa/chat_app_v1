import { Server } from "socket.io";
import { FriendRequestNotification } from "../types/friendTypes";
interface OnlineUser {
    userId: string;
    socketId: string;
}
export declare class NotificationService {
    private io;
    private onlineUsers;
    constructor(io: Server, onlineUsers: OnlineUser[]);
    private sendToUser;
    sendFriendRequestNotification(notification: FriendRequestNotification): boolean;
    sendFriendResponseNotification(notification: FriendRequestNotification): boolean;
    sendFriendCancelNotification(notification: FriendRequestNotification): boolean;
    isUserOnline(userId: string): boolean;
    getOnlineUsers(): string[];
    broadcastToOnlineUsers(event: string, data: any): void;
    sendToMultipleUsers(userIds: string[], event: string, data: any): number;
}
export {};
//# sourceMappingURL=notificationService.d.ts.map