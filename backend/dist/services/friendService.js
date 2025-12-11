"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendService = void 0;
const User_1 = __importDefault(require("../models/User"));
const Friends_1 = __importStar(require("../models/Friends"));
class FriendService {
    // Gửi lời mời kết bạn
    static async sendFriendRequest(params) {
        try {
            const { fromUserId, toUserId, toUsername, message } = params;
            // Xác định người nhận - ưu tiên toUserId, nếu không có thì dùng toUsername
            let targetUser;
            if (toUserId) {
                targetUser = await User_1.default.findById(toUserId);
            }
            else if (toUsername) {
                targetUser = await User_1.default.findOne({ username: toUsername });
            }
            else {
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
            const sender = await User_1.default.findById(fromUserId);
            if (sender?.friends?.includes(toUserIdFinal)) {
                return {
                    success: false,
                    message: "Hai người đã là bạn bè"
                };
            }
            // Kiểm tra đã gửi lời mời chưa
            const existingRequest = await Friends_1.default.findOne({
                fromUserId,
                toUserId: toUserIdFinal,
                status: { $in: [Friends_1.FriendRequestStatus.PENDING] }
            });
            if (existingRequest) {
                return {
                    success: false,
                    message: "Đã gửi lời mời kết bạn cho người này."
                };
            }
            // Kiểm tra có lời mời ngược lại không (người kia đã gửi cho mình)
            const reverseRequest = await Friends_1.default.findOne({
                fromUserId: toUserIdFinal,
                toUserId: fromUserId,
                status: Friends_1.FriendRequestStatus.PENDING
            });
            if (reverseRequest) {
                return {
                    success: false,
                    message: "Người này đã gửi lời mời kết bạn cho bạn. Vui lòng kiểm tra lời mời đã nhận.",
                    hasReverseRequest: true
                };
            }
            // Gửi lời mời kết bạn
            const newRequest = await Friends_1.default.create({
                fromUserId,
                toUserId: toUserIdFinal,
                status: Friends_1.FriendRequestStatus.PENDING,
                message: message || "",
            });
            // Populate thông tin người gửi và người nhận để trả về
            const populatedRequest = await Friends_1.default.findById(newRequest._id)
                .populate('fromUserId', 'firstName lastName displayName username avatar')
                .populate('toUserId', 'firstName lastName displayName username avatar');
            return {
                success: true,
                message: `Đã gửi lời mời kết bạn tới ${targetUser.displayName || targetUser.username}`,
                data: populatedRequest
            };
        }
        catch (error) {
            console.error("Lỗi gửi lời mời kết bạn:", error);
            return {
                success: false,
                message: "Lỗi gửi lời mời kết bạn",
                error
            };
        }
    }
    // Chấp nhận lời mời kết bạn
    static async acceptFriendRequest(requestId, userId) {
        try {
            // Tìm lời mời kết bạn
            const request = await Friends_1.default.findById(requestId);
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
            if (request.status !== Friends_1.FriendRequestStatus.PENDING) {
                return {
                    success: false,
                    message: "Yêu cầu này đã được xử lý."
                };
            }
            // Cập nhật trạng thái lời mời
            request.status = Friends_1.FriendRequestStatus.ACCEPTED;
            await request.save();
            // Thêm vào danh sách bạn bè của cả hai người
            await Promise.all([
                User_1.default.findByIdAndUpdate(request.fromUserId, { $addToSet: { friends: request.toUserId } }),
                User_1.default.findByIdAndUpdate(request.toUserId, { $addToSet: { friends: request.fromUserId } }),
            ]);
            return {
                success: true,
                message: "Đã chấp nhận lời mời",
                data: request
            };
        }
        catch (error) {
            console.error("Lỗi đồng ý lời mời kết bạn:", error);
            return {
                success: false,
                message: "Lỗi đồng ý lời mời kết bạn",
                error
            };
        }
    }
    // Từ chối lời mời kết bạn
    static async declineFriendRequest(requestId, userId) {
        try {
            const request = await Friends_1.default.findById(requestId);
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
            if (request.status !== Friends_1.FriendRequestStatus.PENDING) {
                return {
                    success: false,
                    message: "Yêu cầu này đã được xử lý."
                };
            }
            // ✅ Xóa hoàn toàn khỏi database thay vì chỉ thay đổi status
            await Friends_1.default.findByIdAndDelete(requestId);
            return {
                success: true,
                message: "Đã từ chối lời mời",
                data: request
            };
        }
        catch (error) {
            console.error("Lỗi từ chối lời mời kết bạn:", error);
            return {
                success: false,
                message: "Lỗi từ chối lời mời kết bạn",
                error
            };
        }
    }
    // Hủy lời mời kết bạn đã gửi
    static async cancelFriendRequest(requestId, userId) {
        try {
            const request = await Friends_1.default.findById(requestId);
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
            // ✅ Xóa hoàn toàn khỏi database thay vì chỉ thay đổi status
            await Friends_1.default.findByIdAndDelete(requestId);
            return {
                success: true,
                message: "Đã hủy lời mời kết bạn",
                data: request
            };
        }
        catch (error) {
            console.error("Lỗi hủy lời mời kết bạn:", error);
            return {
                success: false,
                message: "Lỗi hủy lời mời kết bạn",
                error
            };
        }
    }
    // Lấy danh sách lời mời kết bạn nhận được
    static async getFriendRequests(userId) {
        try {
            const requests = await Friends_1.default.find({
                toUserId: userId,
                status: Friends_1.FriendRequestStatus.PENDING
            }).populate('fromUserId', 'firstName lastName displayName avatar username');
            return {
                success: true,
                message: "Danh sách lời mời kết bạn",
                data: requests
            };
        }
        catch (error) {
            console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
            return {
                success: false,
                message: "Lỗi lấy danh sách lời mời kết bạn",
                error
            };
        }
    }
    // Lấy danh sách lời mời đã gửi
    static async getSentFriendRequests(userId) {
        try {
            // ✅ Chỉ lấy PENDING vì declined/cancelled đã bị xóa
            const requests = await Friends_1.default.find({
                fromUserId: userId,
                status: Friends_1.FriendRequestStatus.PENDING
            }).populate('toUserId', 'firstName lastName displayName avatar username');
            return {
                success: true,
                message: "Danh sách lời mời đã gửi",
                data: requests
            };
        }
        catch (error) {
            console.error("Lỗi lấy danh sách lời mời đã gửi:", error);
            return {
                success: false,
                message: "Lỗi lấy danh sách lời mời đã gửi",
                error
            };
        }
    }
    // Lấy danh sách bạn bè
    static async getFriendsList(userId) {
        try {
            const user = await User_1.default.findById(userId).populate("friends", "username displayName firstName lastName email avatarUrl");
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
        }
        catch (error) {
            console.error("Lỗi khi lấy danh sách bạn bè:", error);
            return {
                success: false,
                message: "Lỗi khi lấy danh sách bạn bè",
                error
            };
        }
    }
    // Xóa bạn bè
    static async removeFriend(userId, friendId) {
        try {
            // Kiểm tra người dùng hiện tại
            const currentUser = await User_1.default.findById(userId);
            if (!currentUser) {
                return {
                    success: false,
                    message: "Người dùng không tồn tại"
                };
            }
            // Kiểm tra bạn bè cần xóa
            const friendUser = await User_1.default.findById(friendId);
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
            await User_1.default.findByIdAndUpdate(userId, { $pull: { friends: friendId } }, { new: true });
            // Xóa khỏi danh sách bạn bè của người kia
            await User_1.default.findByIdAndUpdate(friendId, { $pull: { friends: userId } }, { new: true });
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
        }
        catch (error) {
            console.error("Lỗi khi xóa bạn bè:", error);
            return {
                success: false,
                message: "Lỗi khi xóa bạn bè",
                error
            };
        }
    }
}
exports.FriendService = FriendService;
//# sourceMappingURL=friendService.js.map