import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
   user?: Omit<IUser, "hashedPassword">; // loại bỏ field nhạy cảm
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, truy cập bị từ chối." });
    }

    // Xác thực token hợp lệ
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload & { userId: string };
    if (!decoded) {
      return res.status(401).json({ message: "Token không hợp lệ." });
    }
    const user = await User.findById({ _id: decoded.userId }).select(
      "-hashedPassword"
    );
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    // Trả user về req
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Lỗi server nội bộ." });
  }
};
