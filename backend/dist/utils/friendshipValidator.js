"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendshipValidator = void 0;
const User_1 = __importDefault(require("../models/User"));
/**
 * Utility để validate friendship status
 */
class FriendshipValidator {
    /**
     * Kiểm tra xem 2 users có phải bạn bè không
     */
    static async areFriends(userId1, userId2) {
        try {
            const user1 = await User_1.default.findById(userId1);
            if (!user1 || !user1.friends)
                return false;
            // Check nếu userId2 có trong friends array của user1
            return user1.friends.some(friendId => friendId.toString() === userId2.toString());
        }
        catch (error) {
            console.error("Lỗi khi kiểm tra friendship:", error);
            return false;
        }
    }
    /**
     * Kiểm tra và throw error nếu không phải bạn bè
     */
    static async validateFriendship(userId1, userId2) {
        const areFriends = await this.areFriends(userId1, userId2);
        if (!areFriends) {
            throw new Error("Bạn chỉ có thể nhắn tin với người trong danh sách bạn bè");
        }
    }
}
exports.FriendshipValidator = FriendshipValidator;
//# sourceMappingURL=friendshipValidator.js.map