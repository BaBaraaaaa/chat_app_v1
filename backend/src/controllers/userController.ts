
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import { CloudinaryService } from "../services/cloudinaryService";

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

// Cập nhật thông tin profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    const { displayName, bio, phone, avatarUrl } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ message: "Người dùng chưa được xác thực" });
    }

    // Validate input
    if (displayName && displayName.trim().length === 0) {
      return res.status(400).json({ message: "Tên hiển thị không được để trống" });
    }

    if (bio && bio.length > 160) {
      return res.status(400).json({ message: "Bio không được quá 160 ký tự" });
    }

    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Prepare update data
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone || null;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      updateData,
      { new: true, runValidators: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ 
      message: "Cập nhật thông tin thành công", 
      data: updatedUser
    });
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Upload avatar
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;
    const file = req.file;

    if (!currentUserId) {
      return res.status(401).json({ message: "Người dùng chưa được xác thực" });
    }

    if (!file) {
      return res.status(400).json({ message: "Vui lòng chọn file hình ảnh" });
    }

    // Get current user to check for existing avatar
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Delete old avatar if exists
    if (currentUser.avatarId) {
      await CloudinaryService.deleteImage(currentUser.avatarId);
    }

    // Upload new avatar
    const uploadResult = await CloudinaryService.uploadAvatar(file, currentUserId.toString());

    if (!uploadResult.success) {
      return res.status(400).json({
        message: uploadResult.message,
        error: uploadResult.error
      });
    }

    // Update user with new avatar info
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        avatarUrl: uploadResult.data!.url,
        avatarId: uploadResult.data!.publicId
      },
      { new: true, runValidators: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return res.status(404).json({ message: "Không thể cập nhật avatar" });
    }

    res.json({
      message: "Upload avatar thành công",
      data: {
        user: updatedUser,
      }
    });
  } catch (error) {
    console.error("Lỗi upload avatar:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Delete avatar
export const deleteAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Người dùng chưa được xác thực" });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (!currentUser.avatarId) {
      return res.status(400).json({ message: "Người dùng chưa có avatar" });
    }

    // Delete from Cloudinary
    const deleteResult = await CloudinaryService.deleteImage(currentUser.avatarId);

    if (!deleteResult.success) {
      return res.status(400).json({
        message: deleteResult.message,
        error: deleteResult.error
      });
    }

    // Update user to remove avatar info
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $unset: { avatarUrl: 1, avatarId: 1 }
      },
      { new: true, runValidators: true }
    ).select('-hashedPassword');

    if (!updatedUser) {
      return res.status(404).json({ message: "Không thể xóa avatar" });
    }

    res.json({
      message: "Xóa avatar thành công",
      data: updatedUser
    });
  } catch (error) {
    console.error("Lỗi xóa avatar:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

