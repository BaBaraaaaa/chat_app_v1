import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadAvatar } from "../middleware/uploadMiddleware";
import { ConversationController } from "../controllers/conversationController";

const router = Router();
const conversationController = new ConversationController();

// Apply auth middleware to all conversation routes
router.use(authMiddleware);

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await conversationController.getUserConversations(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/conversations/search
 * Search conversations by query
 * Query params: ?q=searchQuery&limit=10&offset=0
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const searchQuery = req.query.q as string;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const result = await conversationController.searchConversations(userId, searchQuery);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/conversations/unread-count
 * Get total unread message count across all conversations
 */
router.get("/unread-count", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await conversationController.getTotalUnreadCount(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    const result = await conversationController.getConversationById(conversationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/conversations/group
 * Create a new group conversation
 * Body: { name: string, participantIds: string[], avatarUrl?: string }
 */
router.post("/group", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, participantIds, avatarUrl } = req.body;

    if (!name || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tên và ít nhất một người tham gia là bắt buộc"
      });
    }

    const result = await conversationController.createGroup(userId, participantIds, name, avatarUrl);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/conversations/:id/participants
 * Add participants to a group
 * Body: { participantIds: string[] }
 */
router.put("/:id/participants", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id!;
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ success: false, message: "Danh sách participantIds không hợp lệ" });
    }

    const result = await conversationController.addParticipants(conversationId, userId, participantIds);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * DELETE /api/conversations/:id/participants
 * Remove a participant (Admin only)
 * Body: { participantId: string }
 */
router.delete("/:id/participants", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id!;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: "participantId là bắt buộc" });
    }

    const result = await conversationController.removeParticipant(conversationId, userId, participantId);

    if (result.success) {
      const io = req.app.get("io");
      if (io) {
        // Thông báo cho người bị xóa
        io.to(`user_${participantId}`).emit("GROUP_MEMBER_REMOVED", {
          conversationId,
          message: "Bạn đã bị xóa khỏi nhóm",
          removedBy: userId
        });

        // Thông báo cho cả nhóm
        io.to(`conversation_${conversationId}`).emit("GROUP_MEMBER_REMOVED", {
          conversationId,
          participantId,
          updatedConversation: result.data,
          message: "Một thành viên đã bị xóa khỏi nhóm"
        });
      }
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * POST /api/conversations/:id/leave
 * Leave a group
 */
router.post("/:id/leave", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id!;

    const result = await conversationController.leaveConversation(conversationId, userId);

    if (result.success) {
      const io = req.app.get("io");
      if (io) {
        // Thông báo cho cả nhóm
        io.to(`conversation_${conversationId}`).emit("GROUP_MEMBER_LEFT", {
          conversationId,
          userId,
          updatedConversation: result.data.conversation,
          message: "Một thành viên đã rời nhóm"
        });
      }
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error instanceof Error ? error.message : String(error) });
  }
});

/**
 * POST /api/conversations
 * Create a new conversation or get existing one
 * Body: { otherUserId: string } for direct conversation
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "otherUserId là bắt buộc"
      });
    }

    const result = await conversationController.getOrCreateDirectConversation(userId, otherUserId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation (soft delete or remove user from conversation)
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "ID cuộc trò chuyện là bắt buộc"
      });
    }

    const result = await conversationController.deleteConversation(conversationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/conversations/:id/read
 * Mark all messages in conversation as read
 */
router.post("/:id/read", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "ID cuộc trò chuyện là bắt buộc"
      });
    }

    const result = await conversationController.resetUnreadCount(conversationId, userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/conversations/:id/avatar
 * Update group avatar (Admin only)
 */
router.post("/:id/avatar", uploadAvatar, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const conversationId = req.params.id!;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Không có file được tải lên" });
    }

    // Upload to cloudinary
    const { CloudinaryService } = require("../services/cloudinaryService");
    const uploadResult = await CloudinaryService.uploadAvatar(req.file, conversationId);

    if (!uploadResult.success || !uploadResult.data) {
      return res.status(500).json({ success: false, message: uploadResult.message || "Lỗi upload ảnh" });
    }

    const result = await conversationController.updateGroupAvatar(conversationId, userId, uploadResult.data.url);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
