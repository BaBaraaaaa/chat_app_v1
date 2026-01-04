import { Response } from "express";
import { GroupInvitationService } from "../services/groupInvitationService";
import { Types } from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";

export class GroupInvitationController {
    /**
     * Gửi lời mời vào nhóm
     * POST /api/group-invitations
     */
    async sendInvitation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const { conversationId, inviteeIds, message } = req.body;

            if (!conversationId || !inviteeIds || !Array.isArray(inviteeIds)) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc"
                });
            }

            const result = await GroupInvitationService.createInvitation(
                new Types.ObjectId(conversationId as string),
                new Types.ObjectId(userId as any),
                inviteeIds.map((id: string) => new Types.ObjectId(id)),
                message as string
            );

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi gửi lời mời"
            });
        }
    }

    /**
     * Chấp nhận lời mời
     * PUT /api/group-invitations/:id/accept
     */
    async acceptInvitation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const { id } = req.params;

            const result = await GroupInvitationService.acceptInvitation(
                new Types.ObjectId(id as string),
                new Types.ObjectId(userId as any)
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Lỗi chấp nhận lời mời:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi chấp nhận lời mời"
            });
        }
    }

    /**
     * Từ chối lời mời
     * PUT /api/group-invitations/:id/decline
     */
    async declineInvitation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const { id } = req.params;

            const result = await GroupInvitationService.declineInvitation(
                new Types.ObjectId(id as string),
                new Types.ObjectId(userId as any)
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Lỗi từ chối lời mời:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi từ chối lời mời"
            });
        }
    }

    /**
     * Hủy lời mời
     * DELETE /api/group-invitations/:id
     */
    async cancelInvitation(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const { id } = req.params;

            const result = await GroupInvitationService.cancelInvitation(
                new Types.ObjectId(id as string),
                new Types.ObjectId(userId as any)
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Lỗi hủy lời mời:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi hủy lời mời"
            });
        }
    }

    /**
     * Lấy lời mời đã nhận
     * GET /api/group-invitations/received
     */
    async getReceivedInvitations(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const result = await GroupInvitationService.getReceivedInvitations(
                new Types.ObjectId(userId as any)
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Lỗi lấy lời mời đã nhận:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy lời mời"
            });
        }
    }

    /**
     * Lấy lời mời đã gửi
     * GET /api/group-invitations/sent
     */
    async getSentInvitations(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng chưa được xác thực"
                });
            }

            const { conversationId } = req.query;

            const result = await GroupInvitationService.getSentInvitations(
                new Types.ObjectId(userId as any),
                conversationId ? new Types.ObjectId(conversationId as string) : undefined
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Lỗi lấy lời mời đã gửi:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy lời mời đã gửi"
            });
        }
    }
}
