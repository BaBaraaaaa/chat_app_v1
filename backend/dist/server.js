"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./libs/db");
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const cors_1 = __importDefault(require("cors"));
const friendsRoute_1 = __importDefault(require("./routes/friendsRoute"));
const registerSocketHandlers_1 = require("./socket/registerSocketHandlers");
const socketAuthMiddleware_1 = require("./middleware/socketAuthMiddleware");
const conversationsRoute_1 = __importDefault(require("./routes/conversationsRoute"));
// Cấu hình dotenv để sử dụng biến môi trường từ file .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Cấu hình Socket.IO với CORS
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    // Cấu hình thêm cho production
    transports: ['websocket', 'polling'],
    allowEIO3: true
});
// ✅ Apply Socket.IO authentication middleware
io.use(socketAuthMiddleware_1.socketAuthMiddleware);
const PORT = process.env.PORT || 5000;
// Middleware để phân tích JSON
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
//public route
app.use('/api/auth/', authRoute_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        socketIO: 'enabled'
    });
});
// Socket connection info endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
    app.get('/socket-info', (req, res) => {
        res.status(200).json({
            connectedClients: io.engine.clientsCount,
            transport: 'Socket.IO',
            cors: process.env.CLIENT_URL || "http://localhost:3000"
        });
    });
    // Serve test client for development
    app.get('/test', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../test-client.html'));
    });
}
//private route (authMiddleware đã được áp dụng trong từng route file)
app.use('/api/user', userRoute_1.default);
app.use("/api/friends", friendsRoute_1.default);
app.use("/api/conversations", conversationsRoute_1.default);
// Đăng ký socket handlers
(0, registerSocketHandlers_1.registerSocketHandlers)(io);
// Middleware để log socket connections
io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id}, reason: ${reason}`);
        console.log(`👥 Total connected clients: ${io.engine.clientsCount}`);
    });
});
// Kết nối database và khởi động server
(0, db_1.connectDb)().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server đang chạy trên port ${PORT}`);
        console.log(`🔗 Socket.IO server đã được khởi tạo`);
        console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    });
}).catch((error) => {
    console.error("❌ Lỗi kết nối database:", error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map