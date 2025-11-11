import User from "../models/User";
import { Types } from "mongoose";

/**
 * Utility để validate friendship status
 */
export class FriendshipValidator {
  /**
   * Kiểm tra xem 2 users có phải bạn bè không
   */
  static async areFriends(
    userId1: Types.ObjectId | string,
    userId2: Types.ObjectId | string
  ): Promise<boolean> {
    try {
      const user1 = await User.findById(userId1);
      if (!user1 || !user1.friends) return false;
      
      // Check nếu userId2 có trong friends array của user1
      return user1.friends.some(
        friendId => friendId.toString() === userId2.toString()
      );
    } catch (error) {
      console.error("Lỗi khi kiểm tra friendship:", error);
      return false;
    }
  }

  /**
   * Kiểm tra và throw error nếu không phải bạn bè
   */
  static async validateFriendship(
    userId1: Types.ObjectId | string,
    userId2: Types.ObjectId | string
  ): Promise<void> {
    const areFriends = await this.areFriends(userId1, userId2);
    if (!areFriends) {
      throw new Error("Bạn chỉ có thể nhắn tin với người trong danh sách bạn bè");
    }
  }
}
