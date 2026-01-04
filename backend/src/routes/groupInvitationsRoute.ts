import { Router } from "express";
import { GroupInvitationController } from "../controllers/groupInvitationController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const controller = new GroupInvitationController();

// Tất cả routes yêu cầu authentication
router.use(authMiddleware);

/**
 * @route   POST /api/group-invitations
 * @desc    Gửi lời mời vào nhóm
 * @access  Private (Admin only)
 */
router.post("/", controller.sendInvitation.bind(controller));

/**
 * @route   GET /api/group-invitations/received
 * @desc    Lấy danh sách lời mời đã nhận
 * @access  Private
 */
router.get("/received", controller.getReceivedInvitations.bind(controller));

/**
 * @route   GET /api/group-invitations/sent
 * @desc    Lấy danh sách lời mời đã gửi
 * @access  Private
 */
router.get("/sent", controller.getSentInvitations.bind(controller));

/**
 * @route   PUT /api/group-invitations/:id/accept
 * @desc    Chấp nhận lời mời
 * @access  Private
 */
router.put("/:id/accept", controller.acceptInvitation.bind(controller));

/**
 * @route   PUT /api/group-invitations/:id/decline
 * @desc    Từ chối lời mời
 * @access  Private
 */
router.put("/:id/decline", controller.declineInvitation.bind(controller));

/**
 * @route   DELETE /api/group-invitations/:id
 * @desc    Hủy lời mời
 * @access  Private (Admin only)
 */
router.delete("/:id", controller.cancelInvitation.bind(controller));

export default router;
