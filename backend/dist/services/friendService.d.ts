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
export declare class FriendService {
    static sendFriendRequest(params: SendFriendRequestParams): Promise<FriendRequestResponse>;
    static acceptFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static declineFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static cancelFriendRequest(requestId: string, userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static getFriendRequests(userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static getSentFriendRequests(userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static getFriendsList(userId: string | Types.ObjectId): Promise<FriendRequestResponse>;
    static removeFriend(userId: string | Types.ObjectId, friendId: string | Types.ObjectId): Promise<FriendRequestResponse>;
}
//# sourceMappingURL=friendService.d.ts.map