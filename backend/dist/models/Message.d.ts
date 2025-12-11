import mongoose, { Document, Types } from "mongoose";
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    SYSTEM = "system"
}
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId?: Types.ObjectId;
    content: string;
    type: MessageType;
    status: MessageStatus;
    attachments?: {
        url: string;
        filename: string;
        fileType: string;
        fileSize: number;
    }[];
    replyTo?: Types.ObjectId;
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    readAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Message;
//# sourceMappingURL=Message.d.ts.map