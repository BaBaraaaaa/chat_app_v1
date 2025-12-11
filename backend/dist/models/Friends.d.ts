import mongoose, { Document, Types } from "mongoose";
export declare enum FriendRequestStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    CANCELLED = "cancelled"
}
export interface IFriendRequest extends Document {
    _id: Types.ObjectId;
    fromUserId: Types.ObjectId;
    toUserId: Types.ObjectId;
    status: FriendRequestStatus;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FriendRequest: mongoose.Model<IFriendRequest, {}, {}, {}, mongoose.Document<unknown, {}, IFriendRequest, {}, {}> & IFriendRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default FriendRequest;
//# sourceMappingURL=Friends.d.ts.map