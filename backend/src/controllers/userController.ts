
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMe = (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi hệ thống khi getMe", error);
    return res.status(500).json({ message: "Lỗi server nội bộ." });
  }
};

