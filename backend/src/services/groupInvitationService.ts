import GroupInvitation, { IGroupInvitation, InvitationStatus } from "../models/GroupInvitation";
import Conversation, { ConversationType } from "../models/Conversation";
import User from "../models/User";
import { Types } from "mongoose";

export interface GroupInvitationResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}

export class GroupInvitationService {
    /**
     * Gửi lời mời vào nhóm
     */
    static async createInvitation(
        conversationId: Types.ObjectId,
        inviterId: Types.ObjectId,
        inviteeIds: Types.ObjectId[],
        message?: string
    ): Promise<GroupInvitationResponse> {
        try {
            if (!inviteeIds || inviteeIds.length === 0) {
                return {
                    success: false,
                    message: "Danh sách người được mời trống"
                };
            }

            // Kiểm tra conversation tồn tại và là group
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return {
                    success: false,
                    message: "Nhóm không tồn tại"
                };
            }

            if (conversation.type !== ConversationType.GROUP) {
                return {
                    success: false,
                    message: "Chức năng chỉ dành cho nhóm"
                };
            }

            // Kiểm tra inviter có phải admin không
            if (!conversation.adminId || conversation.adminId.toString() !== inviterId.toString()) {
                return {
                    success: false,
                    message: "Chỉ quản trị viên mới có thể mời thành viên"
                };
            }

            const results = [];
            const errors = [];

            for (const inviteeId of inviteeIds) {
                try {
                    // Kiểm tra user tồn tại
                    const invitee = await User.findById(inviteeId);
                    if (!invitee) {
                        errors.push(`Người dùng ${inviteeId} không tồn tại`);
                        continue;
                    }

                    // Kiểm tra đã là thành viên chưa
                    const isAlreadyMember = conversation.participants.some(
                        p => p.toString() === inviteeId.toString()
                    );
                    if (isAlreadyMember) {
                        errors.push(`${invitee.displayName || invitee.username} đã là thành viên`);
                        continue;
                    }

                    // Kiểm tra đã có lời mời pending chưa
                    const existingInvitation = await GroupInvitation.findOne({
                        conversationId,
                        inviteeId,
                        status: InvitationStatus.PENDING
                    });

                    if (existingInvitation) {
                        errors.push(`Đã gửi lời mời cho ${invitee.displayName || invitee.username}`);
                        continue;
                    }

                    // Tạo lời mời mới
                    const invitation = await GroupInvitation.create({
                        conversationId,
                        inviterId,
                        inviteeId,
                        message,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
                    });

                    // Populate thông tin
                    const populatedInvitation = await GroupInvitation.findById(invitation._id)
                        .populate('conversationId', 'name avatarUrl participants')
                        .populate('inviterId', 'username displayName avatarUrl')
                        .populate('inviteeId', 'username displayName avatarUrl');

                    results.push(populatedInvitation);
                } catch (error: any) {
                    // Handle duplicate key error gracefully
                    if (error.code === 11000) {
                        errors.push(`Lời mời đã tồn tại`);
                    } else {
                        console.error(`Lỗi tạo lời mời cho ${inviteeId}:`, error);
                        errors.push(`Lỗi tạo lời mời: ${error.message}`);
                    }
                }
            }

            if (results.length === 0) {
                return {
                    success: false,
                    message: errors.join(", ") || "Không thể gửi lời mời",
                    error: errors
                };
            }

            return {
                success: true,
                message: `Đã gửi ${results.length} lời mời${errors.length > 0 ? `. Lỗi: ${errors.join(", ")}` : ""}`,
                data: results
            };
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            return {
                success: false,
                message: "Lỗi gửi lời mời vào nhóm",
                error
            };
        }
    }

    /**
     * Chấp nhận lời mời
     */
    static async acceptInvitation(
        invitationId: Types.ObjectId,
        userId: Types.ObjectId
    ): Promise<GroupInvitationResponse> {
        try {
            const invitation = await GroupInvitation.findById(invitationId);
            if (!invitation) {
                return {
                    success: false,
                    message: "Lời mời không tồn tại"
                };
            }

            // Kiểm tra invitation thuộc về user
            if (invitation.inviteeId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền chấp nhận lời mời này"
                };
            }

            // Kiểm tra status
            if (invitation.status !== InvitationStatus.PENDING) {
                return {
                    success: false,
                    message: `Lời mời đã ${invitation.status === InvitationStatus.ACCEPTED ? 'được chấp nhận' : invitation.status === InvitationStatus.DECLINED ? 'bị từ chối' : 'bị hủy'}`
                };
            }

            // Kiểm tra hết hạn
            if (invitation.expiresAt && new Date() > invitation.expiresAt) {
                invitation.status = InvitationStatus.DECLINED;
                await invitation.save();
                return {
                    success: false,
                    message: "Lời mời đã hết hạn"
                };
            }

            // Thêm user vào conversation
            const conversation = await Conversation.findById(invitation.conversationId);
            if (!conversation) {
                return {
                    success: false,
                    message: "Nhóm không còn tồn tại"
                };
            }

            // Kiểm tra đã là member chưa
            const isAlreadyMember = conversation.participants.some(
                p => p.toString() === userId.toString()
            );

            if (!isAlreadyMember) {
                conversation.participants.push(userId);
                conversation.unreadCount.set(userId.toString(), 0);
                await conversation.save();
            }

            // Cập nhật status
            invitation.status = InvitationStatus.ACCEPTED;
            await invitation.save();

            // Tạo tin nhắn hệ thống
            try {
                const joinedUser = await User.findById(userId);
                if (joinedUser) {
                    const systemContent = `${joinedUser.displayName || joinedUser.username} đã tham gia nhóm qua lời mời`;

                    await (require("../models/Message").default).create({
                        conversationId: invitation.conversationId,
                        senderId: new Types.ObjectId("000000000000000000000000"),
                        content: systemContent,
                        type: "system",
                        status: "sent"
                    });

                    // Cập nhật lastMessage
                    await (require("../models/Conversation").default).findByIdAndUpdate(invitation.conversationId, {
                        lastMessage: {
                            content: systemContent,
                            senderId: new Types.ObjectId("000000000000000000000000"),
                            sentAt: new Date(),
                            type: "system"
                        }
                    });
                }
            } catch (sysErr) {
                console.error("Lỗi tạo tin nhắn hệ thống khi chấp nhận lời mời:", sysErr);
            }

            // Populate conversation info
            const updatedConversation = await Conversation.findById(invitation.conversationId)
                .populate('participants', 'username displayName avatarUrl firstName lastName email');

            const populatedInvitation = await GroupInvitation.findById(invitation._id)
                .populate('conversationId', 'name avatarUrl')
                .populate('inviterId', 'username displayName avatarUrl')
                .populate('inviteeId', 'username displayName avatarUrl');

            return {
                success: true,
                message: "Đã tham gia nhóm thành công",
                data: {
                    invitation: populatedInvitation,
                    conversation: updatedConversation
                }
            };
        } catch (error) {
            console.error("Lỗi chấp nhận lời mời:", error);
            return {
                success: false,
                message: "Lỗi chấp nhận lời mời",
                error
            };
        }
    }

    /**
     * Từ chối lời mời
     */
    static async declineInvitation(
        invitationId: Types.ObjectId,
        userId: Types.ObjectId
    ): Promise<GroupInvitationResponse> {
        try {
            const invitation = await GroupInvitation.findById(invitationId);
            if (!invitation) {
                return {
                    success: false,
                    message: "Lời mời không tồn tại"
                };
            }

            if (invitation.inviteeId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền từ chối lời mời này"
                };
            }

            if (invitation.status !== InvitationStatus.PENDING) {
                return {
                    success: false,
                    message: "Lời mời đã được xử lý"
                };
            }

            invitation.status = InvitationStatus.DECLINED;
            await invitation.save();

            const populatedInvitation = await GroupInvitation.findById(invitation._id)
                .populate('conversationId', 'name avatarUrl')
                .populate('inviterId', 'username displayName avatarUrl')
                .populate('inviteeId', 'username displayName avatarUrl');

            return {
                success: true,
                message: "Đã từ chối lời mời",
                data: populatedInvitation
            };
        } catch (error) {
            console.error("Lỗi từ chối lời mời:", error);
            return {
                success: false,
                message: "Lỗi từ chối lời mời",
                error
            };
        }
    }

    /**
     * Hủy lời mời (admin)
     */
    static async cancelInvitation(
        invitationId: Types.ObjectId,
        adminId: Types.ObjectId
    ): Promise<GroupInvitationResponse> {
        try {
            const invitation = await GroupInvitation.findById(invitationId);
            if (!invitation) {
                return {
                    success: false,
                    message: "Lời mời không tồn tại"
                };
            }

            if (invitation.inviterId.toString() !== adminId.toString()) {
                return {
                    success: false,
                    message: "Bạn không có quyền hủy lời mời này"
                };
            }

            if (invitation.status !== InvitationStatus.PENDING) {
                return {
                    success: false,
                    message: "Lời mời đã được xử lý"
                };
            }

            invitation.status = InvitationStatus.CANCELLED;
            await invitation.save();

            const populatedInvitation = await GroupInvitation.findById(invitation._id)
                .populate('conversationId', 'name avatarUrl')
                .populate('inviterId', 'username displayName avatarUrl')
                .populate('inviteeId', 'username displayName avatarUrl');

            return {
                success: true,
                message: "Đã hủy lời mời",
                data: populatedInvitation
            };
        } catch (error) {
            console.error("Lỗi hủy lời mời:", error);
            return {
                success: false,
                message: "Lỗi hủy lời mời",
                error
            };
        }
    }

    /**
     * Lấy lời mời đã nhận
     */
    static async getReceivedInvitations(
        userId: Types.ObjectId
    ): Promise<GroupInvitationResponse> {
        try {
            const invitations = await GroupInvitation.find({
                inviteeId: userId,
                status: InvitationStatus.PENDING,
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: { $gt: new Date() } }
                ]
            })
                .populate('conversationId', 'name avatarUrl participants')
                .populate('inviterId', 'username displayName avatarUrl')
                .sort({ createdAt: -1 });

            return {
                success: true,
                message: "Lấy danh sách lời mời thành công",
                data: invitations
            };
        } catch (error) {
            console.error("Lỗi lấy lời mời đã nhận:", error);
            return {
                success: false,
                message: "Lỗi lấy danh sách lời mời",
                error
            };
        }
    }

    /**
     * Lấy lời mời đã gửi
     */
    static async getSentInvitations(
        userId: Types.ObjectId,
        conversationId?: Types.ObjectId
    ): Promise<GroupInvitationResponse> {
        try {
            const query: any = {
                inviterId: userId,
                status: InvitationStatus.PENDING
            };

            if (conversationId) {
                query.conversationId = conversationId;
            }

            const invitations = await GroupInvitation.find(query)
                .populate('conversationId', 'name avatarUrl')
                .populate('inviteeId', 'username displayName avatarUrl')
                .sort({ createdAt: -1 });

            return {
                success: true,
                message: "Lấy danh sách lời mời đã gửi thành công",
                data: invitations
            };
        } catch (error) {
            console.error("Lỗi lấy lời mời đã gửi:", error);
            return {
                success: false,
                message: "Lỗi lấy danh sách lời mời đã gửi",
                error
            };
        }
    }
}
