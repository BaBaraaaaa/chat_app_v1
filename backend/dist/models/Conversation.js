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
exports.ConversationType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ConversationType;
(function (ConversationType) {
    ConversationType["DIRECT"] = "direct";
    ConversationType["GROUP"] = "group"; // Chat nhóm (có thể mở rộng sau)
})(ConversationType || (exports.ConversationType = ConversationType = {}));
const ConversationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(ConversationType),
        default: ConversationType.DIRECT,
        required: true
    },
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        content: { type: String },
        senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
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
    }
}, {
    timestamps: true
});
// Index để tìm conversation giữa 2 user nhanh
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ "lastMessage.sentAt": -1 });
// Method để tìm hoặc tạo conversation giữa 2 users
ConversationSchema.statics.findOrCreateDirectConversation = async function (userId1, userId2) {
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
            ])
        });
    }
    return conversation;
};
const Conversation = mongoose_1.default.model("Conversation", ConversationSchema);
exports.default = Conversation;
//# sourceMappingURL=Conversation.js.map