"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Socket.IO authentication middleware
 * Verify JWT token from handshake and attach userId to socket.data
 */
const socketAuthMiddleware = async (socket, next) => {
    try {
        // Lấy token từ auth handshake
        const token = socket.handshake.auth.token;
        if (!token) {
            console.warn(`⚠️ Socket ${socket.id} - No token provided`);
            return next(new Error("Authentication error: No token provided"));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded.userId) {
            console.warn(`⚠️ Socket ${socket.id} - Invalid token`);
            return next(new Error("Authentication error: Invalid token"));
        }
        // ✅ Attach userId to socket.data NGAY KHI CONNECT
        socket.data.userId = decoded.userId;
        console.log(`✅ Socket ${socket.id} authenticated for user ${decoded.userId}`);
        next();
    }
    catch (error) {
        console.error(`❌ Socket authentication error:`, error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new Error("Authentication error: Token expired"));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new Error("Authentication error: Invalid token"));
        }
        return next(new Error("Authentication error"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
//# sourceMappingURL=socketAuthMiddleware.js.map