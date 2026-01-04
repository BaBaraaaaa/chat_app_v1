import { Server, Socket } from "socket.io";
import { GroupInvitationService } from "../../services/groupInvitationService";
import { Types } from "mongoose";

interface OnlineUser {
    userId: string;
    socketId: string;
}

/**
 * Đăng ký các Socket handlers cho Group Invitation system
 */
export const registerGroupInvitationHandler = (
    io: Server,
    socket: Socket,
    onlineUsers: OnlineUser[]
) => {
    // 📨 Gửi lời mời vào nhóm
    socket.on("SEND_GROUP_INVITATION", async (data: {
        conversationId: string;
        inviteeIds: string[];
        message?: string;
    }) => {
        try {
            const inviterId = socket.data.userId;
            if (!inviterId) {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
                return;
            }

            const { conversationId, inviteeIds, message } = data;

            const result = await GroupInvitationService.createInvitation(
                new Types.ObjectId(conversationId),
                new Types.ObjectId(inviterId),
                inviteeIds.map(id => new Types.ObjectId(id)),
                message
            );

            if (result.success) {
                // Emit success to sender
                socket.emit("GROUP_INVITATION_SENT", {
                    success: true,
                    message: result.message,
                    data: result.data
                });

                // Notify each invitee
                const invitations = result.data as any[];
                invitations.forEach((invitation: any) => {
                    const inviteeSocketId = onlineUsers.find(
                        u => u.userId === invitation.inviteeId._id?.toString()
                    )?.socketId;

                    if (inviteeSocketId) {
                        io.to(inviteeSocketId).emit("GROUP_INVITATION_RECEIVED", {
                            invitation
                        });
                    }
                });
            } else {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Lỗi gửi lời mời nhóm:", error);
            socket.emit("GROUP_INVITATION_ERROR", {
                success: false,
                message: "Lỗi gửi lời mời"
            });
        }
    });

    // ✅ Chấp nhận lời mời
    socket.on("ACCEPT_GROUP_INVITATION", async (data: {
        invitationId: string;
    }) => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
                return;
            }

            const { invitationId } = data;

            const result = await GroupInvitationService.acceptInvitation(
                new Types.ObjectId(invitationId),
                new Types.ObjectId(userId)
            );

            if (result.success) {
                socket.emit("GROUP_INVITATION_ACCEPTED", {
                    success: true,
                    message: result.message,
                    data: result.data
                });

                // Notify inviter
                const invitation = result.data.invitation;
                const inviterSocketId = onlineUsers.find(
                    u => u.userId === invitation.inviterId._id?.toString()
                )?.socketId;

                if (inviterSocketId) {
                    io.to(inviterSocketId).emit("GROUP_INVITATION_STATUS_CHANGED", {
                        invitation,
                        status: "accepted"
                    });
                }

                // Notify all group members
                const conversation = result.data.conversation;
                const roomName = `conversation_${conversation._id}`;
                io.to(roomName).emit("GROUP_MEMBER_JOINED", {
                    conversation,
                    newMember: invitation.inviteeId
                });
            } else {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Lỗi chấp nhận lời mời:", error);
            socket.emit("GROUP_INVITATION_ERROR", {
                success: false,
                message: "Lỗi chấp nhận lời mời"
            });
        }
    });

    // ❌ Từ chối lời mời
    socket.on("DECLINE_GROUP_INVITATION", async (data: {
        invitationId: string;
    }) => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
                return;
            }

            const { invitationId } = data;

            const result = await GroupInvitationService.declineInvitation(
                new Types.ObjectId(invitationId),
                new Types.ObjectId(userId)
            );

            if (result.success) {
                socket.emit("GROUP_INVITATION_DECLINED", {
                    success: true,
                    message: result.message,
                    data: result.data
                });

                // Notify inviter
                const invitation = result.data;
                const inviterSocketId = onlineUsers.find(
                    u => u.userId === invitation.inviterId._id?.toString()
                )?.socketId;

                if (inviterSocketId) {
                    io.to(inviterSocketId).emit("GROUP_INVITATION_STATUS_CHANGED", {
                        invitation,
                        status: "declined"
                    });
                }
            } else {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Lỗi từ chối lời mời:", error);
            socket.emit("GROUP_INVITATION_ERROR", {
                success: false,
                message: "Lỗi từ chối lời mời"
            });
        }
    });

    // 🚫 Hủy lời mời (admin)
    socket.on("CANCEL_GROUP_INVITATION", async (data: {
        invitationId: string;
    }) => {
        try {
            const adminId = socket.data.userId;
            if (!adminId) {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
                return;
            }

            const { invitationId } = data;

            const result = await GroupInvitationService.cancelInvitation(
                new Types.ObjectId(invitationId),
                new Types.ObjectId(adminId)
            );

            if (result.success) {
                socket.emit("GROUP_INVITATION_CANCELLED", {
                    success: true,
                    message: result.message,
                    data: result.data
                });

                // Notify invitee
                const invitation = result.data;
                const inviteeSocketId = onlineUsers.find(
                    u => u.userId === invitation.inviteeId._id?.toString()
                )?.socketId;

                if (inviteeSocketId) {
                    io.to(inviteeSocketId).emit("GROUP_INVITATION_STATUS_CHANGED", {
                        invitation,
                        status: "cancelled"
                    });
                }
            } else {
                socket.emit("GROUP_INVITATION_ERROR", {
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Lỗi hủy lời mời:", error);
            socket.emit("GROUP_INVITATION_ERROR", {
                success: false,
                message: "Lỗi hủy lời mời"
            });
        }
    });
};
