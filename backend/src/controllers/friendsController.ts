import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import FriendRequest, { FriendRequestStatus } from "../models/Friends";

// Xử lý gửi lời mời kết bạn
export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const fromUserId = req.user?._id;
    const { toUserId, message } = req.body;
    // Kiểm tra người gửi và người nhận
    if (!fromUserId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }
    if (!toUserId) {
      return res.status(400).json({ message: "Người nhận không hợp lệ." });
    }
    if (fromUserId.toString() === toUserId) {
      return res
        .status(400)
        .json({ message: "Không thể gửi lời mời cho chính mình" });
    }
    // Đã là bạn chưa?
    const sender = await User.findById(fromUserId);
    if (sender?.friends?.includes(toUserId)) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }
    // Kiểm tra đã gửi lời mời chưa
    const existingRequest = await FriendRequest.findOne({
      fromUserId,
      toUserId,
    });
    if (existingRequest && existingRequest.status === FriendRequestStatus.PENDING) {
      return res.status(400).json({ message: "Đã gửi lời mời kết bạn." });
    }

    // Gửi lời mời kết bạn
    const newRequest = await FriendRequest.create({
      fromUserId,
      toUserId,
      status: FriendRequestStatus.PENDING,
      message: message || "",
    });
    res.status(201).json({ message: "Đã gửi lời mời", data: newRequest });
    // ...
  } catch (error) {
    console.error("Lỗi Gửi lời mời kết bạn:", error);
    res.status(500).json({ message: "Lỗi Gửi lời mời kết bạn", error });
  }
};

//Xử lý đồng ý lời mời kết bạn
export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    // Tìm lời mời kết bạn
    const userId = req.user?._id;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ message: "Lời mời kết bạn không tồn tại." });
    }
    if (request.toUserId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xử lý yêu cầu này" });
    }
    // Cập nhật trạng thái lời mời
    request.status = FriendRequestStatus.ACCEPTED;
    await request.save();
    // Thêm vào danh sách bạn bè của cả hai người
    await Promise.all([
      User.findByIdAndUpdate(request.fromUserId, { $addToSet: { friends: request.toUserId } }),
      User.findByIdAndUpdate(request.toUserId, { $addToSet: { friends: request.fromUserId } }),
    ]);
    // Trả về phản hồi thành công
     res.json({ message: "Đã chấp nhận lời mời", data: request });
  } catch (error) {
    console.error("Lỗi đồng ý lời mời kết bạn:", error);
    res.status(500).json({ message: "Lỗi đồng ý lời mời kết bạn", error });
  }
};

// Xử lý từ chối lời mời kết bạn
export const declineFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?._id;
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." });
        }
        if (request.toUserId.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xử lý yêu cầu này" });
        }
        request.status = FriendRequestStatus.DECLINED;
        await request.save();
        res.json({ message: "Đã từ chối lời mời", data: request });
    } catch (error) {
        console.error("Lỗi từ chối lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi từ chối lời mời kết bạn", error });
    }
};

// Xử lý lấy danh sách lời mời kết bạn
export const getFriendRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const requests = await FriendRequest.find({ 
            toUserId: userId, 
            status: FriendRequestStatus.PENDING 
        }).populate('fromUserId', 'firstName lastName displayName avatar');
        
        res.json({ message: "Danh sách lời mời kết bạn", data: requests });
    } catch (error) {
        console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách lời mời kết bạn", error });
    }
};

// Xử lý xóa lời mời kết bạn đã gửi
export const cancelFriendRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?._id;
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." });
        }
        if (request.fromUserId.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xử lý yêu cầu này" });
        }
        
        // Cập nhật status thành CANCELLED thay vì xóa
        request.status = FriendRequestStatus.CANCELLED;
        await request.save();
        
        res.json({ message: "Đã hủy lời mời kết bạn", data: request });
    } catch (error) {
        console.error("Lỗi hủy lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi hủy lời mời kết bạn", error });
    }
};

// Xử lý lấy danh sách lời mời đã gửi
export const getSentFriendRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const requests = await FriendRequest.find({ 
            fromUserId: userId, 
            status: { $in: [FriendRequestStatus.PENDING, FriendRequestStatus.DECLINED] }
        }).populate('toUserId', 'firstName lastName displayName avatar');
        
        res.json({ message: "Danh sách lời mời đã gửi", data: requests });
    } catch (error) {
        console.error("Lỗi lấy danh sách lời mời đã gửi:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách lời mời đã gửi", error });
    }
};
