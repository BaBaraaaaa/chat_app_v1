
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";

export const getMe = (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi hệ thống khi getMe", error);
    return res.status(500).json({ message: "Lỗi server nội bộ." });
  }
};

// Tìm kiếm người dùng
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?._id;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const searchQuery = q.trim();
    if (searchQuery.length < 2) {
      return res.status(400).json({ message: "Từ khóa tìm kiếm phải có ít nhất 2 ký tự" });
    }

    // Tìm kiếm user theo displayName, firstName, lastName, username, email
    const users = await User.find({
      _id: { $ne: currentUserId }, // Loại trừ user hiện tại
      $or: [
        { displayName: { $regex: searchQuery, $options: 'i' } },
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('username displayName firstName lastName email avatarUrl')
    .limit(10); // Giới hạn 10 kết quả

    res.json({ 
      message: "Tìm kiếm thành công", 
      data: users,
      count: users.length 
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm người dùng:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

