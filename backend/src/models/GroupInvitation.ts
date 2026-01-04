import mongoose, { Schema, Document, Types } from "mongoose";

export enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    CANCELLED = "cancelled"
}

export interface IGroupInvitation extends Document {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    inviterId: Types.ObjectId;
    inviteeId: Types.ObjectId;
    status: InvitationStatus;
    message?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const GroupInvitationSchema = new Schema<IGroupInvitation>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },
        inviterId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        inviteeId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: Object.values(InvitationStatus),
            default: InvitationStatus.PENDING,
            index: true
        },
        message: {
            type: String,
            trim: true,
            maxlength: 500
        },
        expiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Compound index để prevent duplicate pending invitations
GroupInvitationSchema.index(
    { conversationId: 1, inviteeId: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: InvitationStatus.PENDING }
    }
);

// Index để query invitations efficiently
GroupInvitationSchema.index({ inviteeId: 1, status: 1 });
GroupInvitationSchema.index({ inviterId: 1, status: 1 });

const GroupInvitation = mongoose.model<IGroupInvitation>(
    "GroupInvitation",
    GroupInvitationSchema
);

export default GroupInvitation;
