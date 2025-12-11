import { Server, Socket } from "socket.io";
interface OnlineUser {
    userId: string;
    socketId: string;
}
/**
 * Đăng ký các Socket handlers cho Conversation system
 */
export declare const registerConversationHandler: (io: Server, socket: Socket, onlineUsers: OnlineUser[]) => void;
export {};
//# sourceMappingURL=registerConversationHandler.d.ts.map