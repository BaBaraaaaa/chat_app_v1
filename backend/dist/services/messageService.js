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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const Message_1 = __importStar(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
class MessageService {
    /**
     * Gửi tin nhắn mới
     */
    static async sendMessage(params) {
        try {
            const { conversationId, senderId, receiverId, content, type = Message_1.MessageType.TEXT, attachments = [], replyTo } = params;
            // Validate content
            if (!content || content.trim().length === 0) {
                return {
                    success: false,
                    message: "Nội dung tin nhắn không được để trống"
                };
            }
            // Kiểm tra conversation tồn tại
            const conversation = await Conversation_1.default.findById(conversationId);
            if (!conversation) {
                return {
                    success: false,
                    message: "Cuộc hội thoại không tồn tại"
                };
            }
            // Kiểm tra user có trong conversation không
            const isParticipant = conversation.participants.some(p => p.toString() === senderId.toString());
            if (!isParticipant) {
                return {
                    success: false,
                    message: "Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này"
                };
            }
            // Tạo message mới
            const newMessage = await Message_1.default.create({
                conversationId,
                senderId,
                receiverId,
                content: content.trim(),
                type,
                attachments,
                replyTo,
                status: Message_1.MessageStatus.SENT
            });
            // Populate thông tin sender
            const populatedMessage = await Message_1.default.findById(newMessage._id)
                .populate('senderId', 'username displayName avatar firstName lastName')
                .populate('receiverId', 'username displayName avatar firstName lastName')
                .populate('replyTo');
            // Cập nhật lastMessage trong conversation
            await Conversation_1.default.findByIdAndUpdate(conversationId, {
                lastMessage: {
                    content: content.trim(),
                    senderId,
                    sentAt: new Date(),
                    type
                },
                // Tăng unread count cho receiver
                $inc: {
                    [`unreadCount.${receiverId.toString()}`]: 1
                }
            });
            return {
                success: true,
                message: "Gửi tin nhắn thành công",
                data: populatedMessage
            };
        }
        catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi gửi tin nhắn",
                error
            };
        }
    }
    /**
     * Lấy danh sách tin nhắn trong conversation
     */
    static async getMessages(conversationId, userId, limit = 50, skip = 0) {
        try {
            // Kiểm tra user có quyền xem conversation không
            const conversation = await Conversation_1.default.findById(conversationId);
            if (!conversation) {
                return {
                    success: false,
                    message: "Cuộc hội thoại không tồn tại"
                };
            }
            const isParticipant = conversation.participants.some(p => p.toString() === userId.toString());
            if (!isParticipant) {
                return {
                    success: false,
                    message: "Bạn không có quyền xem tin nhắn trong cuộc hội thoại này"
                };
            }
            // Lấy messages
            const messages = await Message_1.default.find({
                conversationId,
                isDeleted: false
            })
                .populate('senderId', 'username displayName avatar firstName lastName')
                .populate('receiverId', 'username displayName avatar firstName lastName')
                .populate('replyTo')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
            const total = await Message_1.default.countDocuments({
                conversationId,
                isDeleted: false
            });
            return {
                success: true,
                message: "Lấy tin nhắn thành công",
                data: {
                    messages,
                    total,
                    hasMore: skip + messages.length < total
                }
            };
        }
        catch (error) {
            console.error("Lỗi lấy tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi lấy tin nhắn",
                error
            };
        }
    }
    /**
     * Đánh dấu tin nhắn đã đọc
     */
    static async markAsRead(messageId, userId) {
        try {
            const message = await Message_1.default.findById(messageId);
            if (!message) {
                return {
                    success: false,
                    message: "Tin nhắn không tồn tại"
                };
            }
            // Chỉ receiver mới có thể đánh dấu đã đọc
            if (!message.receiverId || message.receiverId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền đánh dấu tin nhắn này"
                };
            }
            if (message.status === Message_1.MessageStatus.READ) {
                return {
                    success: true,
                    message: "Tin nhắn đã được đọc trước đó",
                    data: message
                };
            }
            message.status = Message_1.MessageStatus.READ;
            message.readAt = new Date();
            await message.save();
            return {
                success: true,
                message: "Đã đánh dấu tin nhắn đã đọc",
                data: message
            };
        }
        catch (error) {
            console.error("Lỗi đánh dấu tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi đánh dấu tin nhắn",
                error
            };
        }
    }
    /**
     * Đánh dấu tất cả tin nhắn trong conversation đã đọc
     */
    static async markAllAsRead(conversationId, userId) {
        try {
            const result = await Message_1.default.updateMany({
                conversationId,
                receiverId: userId,
                status: { $ne: Message_1.MessageStatus.READ }
            }, {
                status: Message_1.MessageStatus.READ,
                readAt: new Date()
            });
            // Reset unread count trong conversation
            await Conversation_1.default.findByIdAndUpdate(conversationId, {
                [`unreadCount.${userId.toString()}`]: 0
            });
            return {
                success: true,
                message: `Đã đánh dấu ${result.modifiedCount} tin nhắn đã đọc`,
                data: { count: result.modifiedCount }
            };
        }
        catch (error) {
            console.error("Lỗi đánh dấu tất cả tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi đánh dấu tất cả tin nhắn",
                error
            };
        }
    }
    /**
     * Xóa tin nhắn (soft delete)
     */
    static async deleteMessage(messageId, userId) {
        try {
            const message = await Message_1.default.findById(messageId);
            if (!message) {
                return {
                    success: false,
                    message: "Tin nhắn không tồn tại"
                };
            }
            // Chỉ người gửi mới có thể xóa
            if (message.senderId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền xóa tin nhắn này"
                };
            }
            const conversationId = message.conversationId;
            // Soft delete message
            message.isDeleted = true;
            message.deletedAt = new Date();
            await message.save();
            // ✅ Cập nhật lastMessage trong conversation
            // Tìm tin nhắn gần nhất chưa bị xóa
            const latestMessage = await Message_1.default.findOne({
                conversationId,
                isDeleted: false
            })
                .sort({ createdAt: -1 })
                .populate('senderId', 'username displayName avatar');
            if (latestMessage) {
                // Còn tin nhắn → Cập nhật lastMessage thành tin nhắn gần nhất
                await Conversation_1.default.findByIdAndUpdate(conversationId, {
                    lastMessage: {
                        content: latestMessage.content,
                        senderId: latestMessage.senderId,
                        sentAt: latestMessage.createdAt,
                        type: latestMessage.type
                    }
                });
                console.log(`✅ Updated lastMessage to latest message: ${latestMessage._id}`);
            }
            else {
                // Không còn tin nhắn nào → Xóa lastMessage
                await Conversation_1.default.findByIdAndUpdate(conversationId, {
                    $unset: { lastMessage: "" }
                });
                console.log(`✅ Removed lastMessage (no messages left in conversation)`);
            }
            return {
                success: true,
                message: "Đã xóa tin nhắn",
                data: message
            };
        }
        catch (error) {
            console.error("Lỗi xóa tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi xóa tin nhắn",
                error
            };
        }
    }
    /**
     * Lấy số lượng tin nhắn chưa đọc
     */
    static async getUnreadCount(userId, conversationId) {
        try {
            const count = await Message_1.default.countUnreadMessages(userId, conversationId);
            return {
                success: true,
                message: "Lấy số lượng tin nhắn chưa đọc thành công",
                data: { count }
            };
        }
        catch (error) {
            console.error("Lỗi lấy số lượng tin nhắn chưa đọc:", error);
            return {
                success: false,
                message: "Lỗi lấy số lượng tin nhắn chưa đọc",
                error
            };
        }
    }
    /**
     * Chỉnh sửa tin nhắn
     */
    static async editMessage(messageId, userId, newContent) {
        try {
            const message = await Message_1.default.findById(messageId);
            if (!message) {
                return {
                    success: false,
                    message: "Tin nhắn không tồn tại"
                };
            }
            // Chỉ người gửi mới có thể chỉnh sửa
            if (message.senderId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền chỉnh sửa tin nhắn này"
                };
            }
            if (!newContent || newContent.trim().length === 0) {
                return {
                    success: false,
                    message: "Nội dung tin nhắn không được để trống"
                };
            }
            message.content = newContent.trim();
            message.isEdited = true;
            await message.save();
            const populatedMessage = await Message_1.default.findById(messageId)
                .populate('senderId', 'username displayName avatar firstName lastName')
                .populate('receiverId', 'username displayName avatar firstName lastName');
            return {
                success: true,
                message: "Đã chỉnh sửa tin nhắn",
                data: populatedMessage
            };
        }
        catch (error) {
            console.error("Lỗi chỉnh sửa tin nhắn:", error);
            return {
                success: false,
                message: "Lỗi chỉnh sửa tin nhắn",
                error
            };
        }
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map