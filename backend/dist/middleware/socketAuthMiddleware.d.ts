import { Socket } from "socket.io";
/**
 * Socket.IO authentication middleware
 * Verify JWT token from handshake and attach userId to socket.data
 */
export declare const socketAuthMiddleware: (socket: Socket, next: (err?: Error) => void) => Promise<void>;
//# sourceMappingURL=socketAuthMiddleware.d.ts.map