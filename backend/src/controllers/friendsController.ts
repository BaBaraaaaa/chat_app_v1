import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { FriendService } from "../services/friendService";

//lấy danh sách bạn bè
export const getFriendsList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    const result = await FriendService.getFriendsList(userId.toString());
    
    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data
      });
    } else {
      res.status(404).json({ message: result.message });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách bạn bè", error });
  }
};

// Xử lý gửi lời mời kết bạn
export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const fromUserId = req.user?._id;
    const { toUserId, toUsername, message } = req.body;
    
    // Kiểm tra người gửi
    if (!fromUserId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    const result = await FriendService.sendFriendRequest({
      fromUserId: fromUserId.toString(),
      toUserId,
      toUsername,
      message
    });

    if (result.success) {
      res.status(201).json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      const statusCode = result.hasReverseRequest ? 400 : 
                        result.message.includes("không tìm thấy") ? 404 : 400;
      res.status(statusCode).json({ 
        message: result.message,
        hasReverseRequest: result.hasReverseRequest 
      });
    }
  } catch (error) {
    console.error("Lỗi Gửi lời mời kết bạn:", error);
    res.status(500).json({ message: "Lỗi Gửi lời mời kết bạn", error });
  }
};

//Xử lý đồng ý lời mời kết bạn
export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?._id;
    
    if (!userId || !requestId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
    }

    const result = await FriendService.acceptFriendRequest(requestId, userId.toString());

    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      const statusCode = result.message.includes("không tồn tại") ? 404 :
                        result.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({ message: result.message });
    }
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
    
    if (!userId || !requestId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
    }

    const result = await FriendService.declineFriendRequest(requestId, userId.toString());

    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      const statusCode = result.message.includes("không tồn tại") ? 404 :
                        result.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
    console.error("Lỗi từ chối lời mời kết bạn:", error);
    res.status(500).json({ message: "Lỗi từ chối lời mời kết bạn", error });
  }
};

// Xử lý lấy danh sách lời mời kết bạn
export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    const result = await FriendService.getFriendRequests(userId.toString());

    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      res.status(500).json({ message: result.message });
    }
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
    
    if (!userId || !requestId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
    }

    const result = await FriendService.cancelFriendRequest(requestId, userId.toString());

    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      const statusCode = result.message.includes("không tồn tại") ? 404 :
                        result.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({ message: result.message });
    }
  } catch (error) {
    console.error("Lỗi hủy lời mời kết bạn:", error);
    res.status(500).json({ message: "Lỗi hủy lời mời kết bạn", error });
  }
};

// Xử lý lấy danh sách lời mời đã gửi
export const getSentFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
    }

    const result = await FriendService.getSentFriendRequests(userId.toString());

    if (result.success) {
      res.json({ 
        message: result.message, 
        data: result.data 
      });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách lời mời đã gửi:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách lời mời đã gửi", error });
  }
};
