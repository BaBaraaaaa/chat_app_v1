import mongoose, { Schema, Document, Types } from "mongoose";

export enum ConversationType {
  DIRECT = "direct",    // Chat 1-1
  GROUP = "group"       // Chat nhóm (có thể mở rộng sau)
}

export interface IConversation extends Document {
  type: ConversationType;
  participants: Types.ObjectId[]; // Danh sách user IDs
  adminId?: Types.ObjectId; // Admin của group
  name?: string; // Tên nhóm
  avatarUrl?: string; // Avatar nhóm
  lastMessage?: {
    messageId: Types.ObjectId;
    content: string;
    senderId: Types.ObjectId;
    sentAt: Date;
    type: string;
  };
  unreadCount: Map<string, number>; // userId -> unread count
  isActive: boolean;
  hiddenBy: Types.ObjectId[]; // Danh sách user ẩn cuộc hội thoại này
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: Object.values(ConversationType),
      default: ConversationType.DIRECT,
      required: true
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    adminId: { type: Schema.Types.ObjectId, ref: "User" }, // Admin của group
    name: { type: String }, // Tên nhóm
    avatarUrl: { type: String }, // Avatar nhóm
    lastMessage: {
      messageId: { type: Schema.Types.ObjectId, ref: "Message" },
      content: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      sentAt: { type: Date },
      type: { type: String }
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    isActive: {
      type: Boolean,
      default: true
    },
    hiddenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index để tìm conversation giữa 2 user nhanh
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ "lastMessage.sentAt": -1 });
ConversationSchema.index({ hiddenBy: 1 });

// Method để tìm hoặc tạo conversation giữa 2 users
ConversationSchema.statics.findOrCreateDirectConversation = async function (
  userId1: Types.ObjectId,
  userId2: Types.ObjectId
) {
  // Tìm conversation đã tồn tại
  let conversation = await this.findOne({
    type: ConversationType.DIRECT,
    participants: { $all: [userId1, userId2], $size: 2 }
  });

  // Nếu chưa có thì tạo mới
  if (!conversation) {
    conversation = await this.create({
      type: ConversationType.DIRECT,
      participants: [userId1, userId2],
      unreadCount: new Map([
        [userId1.toString(), 0],
        [userId2.toString(), 0]
      ]),
      hiddenBy: []
    });
  } else {
    // Nếu conversation đã tồn tại, xóa user khỏi hiddenBy nếu họ đang ở đó
    if (conversation.hiddenBy && (conversation.hiddenBy.includes(userId1) || conversation.hiddenBy.includes(userId2))) {
      await this.findByIdAndUpdate(conversation._id, {
        $pull: { hiddenBy: { $in: [userId1, userId2] } }
      });
      conversation = await this.findById(conversation._id);
    }
  }

  return conversation;
};

const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
