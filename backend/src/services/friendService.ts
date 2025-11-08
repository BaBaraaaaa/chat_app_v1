import User from "../models/User";
import FriendRequest, { FriendRequestStatus } from "../models/Friends";
import { Types } from "mongoose";

export interface SendFriendRequestParams {
  fromUserId: string | Types.ObjectId;
  toUserId?: string | Types.ObjectId | undefined;
  toUsername?: string | undefined;
  message?: string | undefined;
}

export interface FriendRequestResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  hasReverseRequest?: boolean;
}

export class FriendService {
  
  // Gửi lời mời kết bạn
  static async sendFriendRequest(params: SendFriendRequestParams): Promise<FriendRequestResponse> {
    try {
      const { fromUserId, toUserId, toUsername, message } = params;
      
      // Xác định người nhận - ưu tiên toUserId, nếu không có thì dùng toUsername
      let targetUser;
      if (toUserId) {
        targetUser = await User.findById(toUserId);
      } else if (toUsername) {
        targetUser = await User.findOne({ username: toUsername });
      } else {
        return {
          success: false,
          message: "Vui lòng cung cấp userId hoặc username của người nhận."
        };
      }

      if (!targetUser) {
        return {
          success: false,
          message: "Không tìm thấy người dùng."
        };
      }

      const toUserIdFinal = targetUser._id;

      // Kiểm tra không gửi cho chính mình
      if (fromUserId.toString() === toUserIdFinal.toString()) {
        return {
          success: false,
          message: "Không thể gửi lời mời cho chính mình"
        };
      }

      // Kiểm tra đã là bạn chưa
      const sender = await User.findById(fromUserId);
      if (sender?.friends?.includes(toUserIdFinal)) {
        return {
          success: false,
          message: "Hai người đã là bạn bè"
        };
      }

      // Kiểm tra đã gửi lời mời chưa
      const existingRequest = await FriendRequest.findOne({
        fromUserId,
        toUserId: toUserIdFinal,
        status: { $in: [FriendRequestStatus.PENDING] }
      });

      if (existingRequest) {
        return {
          success: false,
          message: "Đã gửi lời mời kết bạn cho người này."
        };
      }

      // Kiểm tra có lời mời ngược lại không (người kia đã gửi cho mình)
      const reverseRequest = await FriendRequest.findOne({
        fromUserId: toUserIdFinal,
        toUserId: fromUserId,
        status: FriendRequestStatus.PENDING
      });

      if (reverseRequest) {
        return {
          success: false,
          message: "Người này đã gửi lời mời kết bạn cho bạn. Vui lòng kiểm tra lời mời đã nhận.",
          hasReverseRequest: true
        };
      }

      // Gửi lời mời kết bạn
      const newRequest = await FriendRequest.create({
        fromUserId,
        toUserId: toUserIdFinal,
        status: FriendRequestStatus.PENDING,
        message: message || "",
      });

      // Populate thông tin người gửi và người nhận để trả về
      const populatedRequest = await FriendRequest.findById(newRequest._id)
        .populate('fromUserId', 'firstName lastName displayName username avatar')
        .populate('toUserId', 'firstName lastName displayName username avatar');

      return {
        success: true,
        message: `Đã gửi lời mời kết bạn tới ${targetUser.displayName || targetUser.username}`,
        data: populatedRequest
      };

    } catch (error) {
      console.error("Lỗi gửi lời mời kết bạn:", error);
      return {
        success: false,
        message: "Lỗi gửi lời mời kết bạn",
        error
      };
    }
  }

  // Chấp nhận lời mời kết bạn
  static async acceptFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      // Tìm lời mời kết bạn
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        return {
          success: false,
          message: "Lời mời kết bạn không tồn tại."
        };
      }

      if (request.toUserId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền xử lý yêu cầu này"
        };
      }

      if (request.status !== FriendRequestStatus.PENDING) {
        return {
          success: false,
          message: "Yêu cầu này đã được xử lý."
        };
      }

      // Cập nhật trạng thái lời mời
      request.status = FriendRequestStatus.ACCEPTED;
      await request.save();

      // Thêm vào danh sách bạn bè của cả hai người
      await Promise.all([
        User.findByIdAndUpdate(request.fromUserId, { $addToSet: { friends: request.toUserId } }),
        User.findByIdAndUpdate(request.toUserId, { $addToSet: { friends: request.fromUserId } }),
      ]);

      return {
        success: true,
        message: "Đã chấp nhận lời mời",
        data: request
      };

    } catch (error) {
      console.error("Lỗi đồng ý lời mời kết bạn:", error);
      return {
        success: false,
        message: "Lỗi đồng ý lời mời kết bạn",
        error
      };
    }
  }

  // Từ chối lời mời kết bạn
  static async declineFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        return {
          success: false,
          message: "Lời mời kết bạn không tồn tại."
        };
      }

      if (request.toUserId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền xử lý yêu cầu này"
        };
      }

      if (request.status !== FriendRequestStatus.PENDING) {
        return {
          success: false,
          message: "Yêu cầu này đã được xử lý."
        };
      }

      request.status = FriendRequestStatus.DECLINED;
      await request.save();

      return {
        success: true,
        message: "Đã từ chối lời mời",
        data: request
      };

    } catch (error) {
      console.error("Lỗi từ chối lời mời kết bạn:", error);
      return {
        success: false,
        message: "Lỗi từ chối lời mời kết bạn",
        error
      };
    }
  }

  // Hủy lời mời kết bạn đã gửi
  static async cancelFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      const request = await FriendRequest.findById(requestId);
      if (!request) {
        return {
          success: false,
          message: "Lời mời kết bạn không tồn tại."
        };
      }

      if (request.fromUserId.toString() !== userId.toString()) {
        return {
          success: false,
          message: "Bạn không có quyền xử lý yêu cầu này"
        };
      }

      // Cập nhật status thành CANCELLED thay vì xóa
      request.status = FriendRequestStatus.CANCELLED;
      await request.save();

      return {
        success: true,
        message: "Đã hủy lời mời kết bạn",
        data: request
      };

    } catch (error) {
      console.error("Lỗi hủy lời mời kết bạn:", error);
      return {
        success: false,
        message: "Lỗi hủy lời mời kết bạn",
        error
      };
    }
  }

  // Lấy danh sách lời mời kết bạn nhận được
  static async getFriendRequests(userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      const requests = await FriendRequest.find({ 
        toUserId: userId, 
        status: FriendRequestStatus.PENDING 
      }).populate('fromUserId', 'firstName lastName displayName avatar username');
      
      return {
        success: true,
        message: "Danh sách lời mời kết bạn",
        data: requests
      };

    } catch (error) {
      console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
      return {
        success: false,
        message: "Lỗi lấy danh sách lời mời kết bạn",
        error
      };
    }
  }

  // Lấy danh sách lời mời đã gửi
  static async getSentFriendRequests(userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      const requests = await FriendRequest.find({ 
        fromUserId: userId, 
        status: { $in: [FriendRequestStatus.PENDING, FriendRequestStatus.DECLINED] }
      }).populate('toUserId', 'firstName lastName displayName avatar username');
      
      return {
        success: true,
        message: "Danh sách lời mời đã gửi",
        data: requests
      };

    } catch (error) {
      console.error("Lỗi lấy danh sách lời mời đã gửi:", error);
      return {
        success: false,
        message: "Lỗi lấy danh sách lời mời đã gửi",
        error
      };
    }
  }

  // Lấy danh sách bạn bè
  static async getFriendsList(userId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      const user = await User.findById(userId).populate("friends", "username displayName firstName lastName email avatarUrl");
      
      if (!user) {
        return {
          success: false,
          message: "Người dùng không tồn tại"
        };
      }

      return {
        success: true,
        message: "Danh sách bạn bè",
        data: { friends: user.friends || [] }
      };

    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      return {
        success: false,
        message: "Lỗi khi lấy danh sách bạn bè",
        error
      };
    }
  }

  // Xóa bạn bè
  static async removeFriend(userId: string | Types.ObjectId, friendId: string | Types.ObjectId): Promise<FriendRequestResponse> {
    try {
      // Kiểm tra người dùng hiện tại
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return {
          success: false,
          message: "Người dùng không tồn tại"
        };
      }

      // Kiểm tra bạn bè cần xóa
      const friendUser = await User.findById(friendId);
      if (!friendUser) {
        return {
          success: false,
          message: "Bạn bè không tồn tại"
        };
      }

      // Kiểm tra xem hai người có phải bạn bè không
      const isFriend = currentUser.friends?.some(friend => friend.toString() === friendId.toString());
      if (!isFriend) {
        return {
          success: false,
          message: "Hai người không phải bạn bè"
        };
      }

      // Xóa khỏi danh sách bạn bè của người dùng hiện tại
      await User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
        { new: true }
      );

      // Xóa khỏi danh sách bạn bè của người kia
      await User.findByIdAndUpdate(
        friendId,
        { $pull: { friends: userId } },
        { new: true }
      );

      return {
        success: true,
        message: `Đã xóa ${friendUser.displayName} khỏi danh sách bạn bè`,
        data: {
          removedFriend: {
            _id: friendUser._id,
            username: friendUser.username,
            displayName: friendUser.displayName,
            email: friendUser.email
          }
        }
      };

    } catch (error) {
      console.error("Lỗi khi xóa bạn bè:", error);
      return {
        success: false,
        message: "Lỗi khi xóa bạn bè",
        error
      };
    }
  }
}