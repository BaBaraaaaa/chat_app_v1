import { Server, Socket } from "socket.io";
interface OnlineUser {
    userId: string;
    socketId: string;
}
/**
 * Đăng ký các Socket handlers cho Message system
 */
export declare const registerMessageHandler: (io: Server, socket: Socket, onlineUsers: OnlineUser[]) => void;
export {};
//# sourceMappingURL=registerMessageHandler.d.ts.map