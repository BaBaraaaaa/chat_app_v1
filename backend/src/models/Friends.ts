import mongoose, { Document, Schema, Types } from "mongoose";

// tạo enum cho request status
export enum FriendRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  CANCELLED = "cancelled",
}
// định nghĩa interface cho FriendRequest document
export interface IFriendRequest extends Document {
  _id: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  status: FriendRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}
// định nghĩa schema cho FriendRequest
const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    fromUserId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    toUserId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
      required: true,
    },
    message: { type: String },
  },
  { timestamps: true }
);

// Tạo compound index để tránh duplicate friend requests
FriendRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Export model
export const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);
export default FriendRequest;