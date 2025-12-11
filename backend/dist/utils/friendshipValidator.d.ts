import { Types } from "mongoose";
/**
 * Utility để validate friendship status
 */
export declare class FriendshipValidator {
    /**
     * Kiểm tra xem 2 users có phải bạn bè không
     */
    static areFriends(userId1: Types.ObjectId | string, userId2: Types.ObjectId | string): Promise<boolean>;
    /**
     * Kiểm tra và throw error nếu không phải bạn bè
     */
    static validateFriendship(userId1: Types.ObjectId | string, userId2: Types.ObjectId | string): Promise<void>;
}
//# sourceMappingURL=friendshipValidator.d.ts.map