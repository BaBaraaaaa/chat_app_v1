import { Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Socket.IO authentication middleware
 * Verify JWT token from handshake and attach userId to socket.data
 */
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    // Lấy token từ auth handshake
    const token = socket.handshake.auth.token;

    if (!token) {
      console.warn(`⚠️ Socket ${socket.id} - No token provided`);
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload & { userId: string };

    if (!decoded || !decoded.userId) {
      console.warn(`⚠️ Socket ${socket.id} - Invalid token`);
      return next(new Error("Authentication error: Invalid token"));
    }

    // ✅ Attach userId to socket.data NGAY KHI CONNECT
    socket.data.userId = decoded.userId;

    next();
  } catch (error) {
    console.error(`❌ Socket authentication error:`, error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error("Authentication error: Token expired"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error("Authentication error: Invalid token"));
    }
    
    return next(new Error("Authentication error"));
  }
};
