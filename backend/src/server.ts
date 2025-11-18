import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { connectDb } from './libs/db';
import authRoute from './routes/authRoute';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/authMiddleware';
import userRoute from './routes/userRoute';
import cors from 'cors';
import friendRequestRoute from './routes/friendsRoute';
import { registerSocketHandlers } from './socket/registerSocketHandlers';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware';
import conversationRoute from './routes/conversationsRoute';
// Cấu hình dotenv để sử dụng biến môi trường từ file .env
dotenv.config();

const app = express();
const server = createServer(app);

// Cấu hình Socket.IO với CORS
const io = new Server(server, {
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
io.use(socketAuthMiddleware);

const PORT = process.env.PORT || 5000;

// Middleware để phân tích JSON
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//public route
app.use('/api/auth/', authRoute);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    socketIO: 'enabled'
  });
});

// Socket connection info endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/socket-info', (req: Request, res: Response) => {
    res.status(200).json({
      connectedClients: io.engine.clientsCount,
      transport: 'Socket.IO',
      cors: process.env.CLIENT_URL || "http://localhost:3000"
    });
  });

  // Serve test client for development
  app.get('/test', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../test-client.html'));
  });
}

//private route (authMiddleware đã được áp dụng trong từng route file)
app.use('/api/user', userRoute);
app.use("/api/friends", friendRequestRoute);
app.use("/api/conversations", conversationRoute);

// Đăng ký socket handlers
registerSocketHandlers(io);

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
connectDb().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server đang chạy trên port ${PORT}`);
        console.log(`🔗 Socket.IO server đã được khởi tạo`);
        console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
    });
}).catch((error) => {
    console.error("❌ Lỗi kết nối database:", error);
    process.exit(1);
});

