import mongoose, { Document, Types } from "mongoose";
export declare enum ConversationType {
    DIRECT = "direct",// Chat 1-1
    GROUP = "group"
}
export interface IConversation extends Document {
    type: ConversationType;
    participants: Types.ObjectId[];
    lastMessage?: {
        content: string;
        senderId: Types.ObjectId;
        sentAt: Date;
        type: string;
    };
    unreadCount: Map<string, number>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Conversation;
//# sourceMappingURL=Conversation.d.ts.map