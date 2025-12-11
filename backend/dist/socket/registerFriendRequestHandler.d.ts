import { Server, Socket } from "socket.io";
interface OnlineUser {
    userId: string;
    socketId: string;
}
export declare const registerFriendRequestHandler: (io: Server, socket: Socket, onlineUsers: OnlineUser[]) => void;
export {};
//# sourceMappingURL=registerFriendRequestHandler.d.ts.map