"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.MessageType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
const MessageSchema = new mongoose_1.Schema({
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
    deletedAt: {
        type: Date
    },
    readAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Index để tối ưu query
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ receiverId: 1, status: 1 }); // Query unread messages
// Static method để lấy unread messages
MessageSchema.statics.getUnreadMessages = async function (userId, conversationId) {
    const query = {
        receiverId: userId,
        status: { $ne: MessageStatus.READ },
        isDeleted: false
    };
    if (conversationId) {
        query.conversationId = conversationId;
    }
    return await this.find(query)
        .populate('senderId', 'username displayName avatar')
        .populate('conversationId')
        .sort({ createdAt: -1 });
};
// Static method để đếm số lượng unread messages
MessageSchema.statics.countUnreadMessages = async function (userId, conversationId) {
    const query = {
        receiverId: userId,
        status: { $ne: MessageStatus.READ },
        isDeleted: false
    };
    if (conversationId) {
        query.conversationId = conversationId;
    }
    return await this.countDocuments(query);
};
const Message = mongoose_1.default.model("Message", MessageSchema);
exports.default = Message;
//# sourceMappingURL=Message.js.map