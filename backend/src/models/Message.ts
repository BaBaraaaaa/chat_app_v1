import mongoose, { Schema, Document, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system"
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read"
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId?: Types.ObjectId; // optional cho group chats
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
  }[];
  replyTo?: Types.ObjectId; // ID của message được reply
  isEdited: boolean;
  isDeleted: boolean; // Xóa cho tất cả mọi người
  deletedBy: Types.ObjectId[]; // Danh sách user ẩn tin nhắn này cho riêng họ
  deletedAt?: Date;
  readAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional cho group chat
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT
    },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT
    },
    attachments: {
      type: [
        {
          url: { type: String, required: true },
          filename: { type: String, required: true },
          fileType: { type: String },
          fileSize: { type: Number }
        }
      ],
      default: []
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message"
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    deletedAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index để tối ưu query
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ receiverId: 1, status: 1 }); // Query unread messages

// Static method để lấy unread messages
MessageSchema.statics.getUnreadMessages = async function (
  userId: Types.ObjectId,
  conversationId?: Types.ObjectId
) {
  const query: any = {
    receiverId: userId,
    status: { $ne: MessageStatus.READ },
    isDeleted: false,
    deletedBy: { $ne: userId }
  };

  if (conversationId) {
    query.conversationId = conversationId;
  }

  return await this.find(query)
    .populate('senderId', 'username displayName avatarUrl')
    .populate('conversationId')
    .sort({ createdAt: -1 });
};

// Static method để đếm số lượng unread messages
MessageSchema.statics.countUnreadMessages = async function (
  userId: Types.ObjectId,
  conversationId?: Types.ObjectId
) {
  const query: any = {
    receiverId: userId,
    status: { $ne: MessageStatus.READ },
    isDeleted: false,
    deletedBy: { $ne: userId }
  };

  if (conversationId) {
    query.conversationId = conversationId;
  }

  return await this.countDocuments(query);
};

const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
