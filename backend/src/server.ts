import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDb } from './libs/db';
import authRoute from './routes/authRoute';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/authMiddleware';
import userRoute from './routes/userRoute';
import cors from 'cors';
import friendRequestRoute from './routes/friendsRoute';

// Cấu hình dotenv để sử dụng biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để phân tích JSON
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//public route
app.use('/api/auth/', authRoute);

//private route (authMiddleware đã được áp dụng trong từng route file)
app.use('/api/user', userRoute);
app.use("/api/friends", friendRequestRoute);
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server đang chạy trên ${PORT}`);
    });
});

