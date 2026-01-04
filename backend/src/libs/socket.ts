import { Server } from "socket.io";

let io: Server;

/**
 * Set the global Socket.IO server instance
 */
export const setIO = (ioInstance: Server) => {
    io = ioInstance;
};

/**
 * Get the global Socket.IO server instance
 */
export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Call setIO(io) first.");
    }
    return io;
};
