import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { MessageController } from "../controllers/messageController";

const router = Router();
const messageController = new MessageController();

// Apply auth middleware to all message routes
router.use(authMiddleware);

/**
 * GET /api/messages/unread-count
 * Get total unread message count or for specific conversation
 * Query params: ?conversationId=xxx
 */
router.get("/unread-count", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const conversationId = req.query.conversationId as string;

        const result = await messageController.getUnreadCount(userId, conversationId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * POST /api/messages/conversations/:conversationId/mark-all-read
 * Mark all messages in conversation as read
 */
router.post("/conversations/:conversationId/mark-all-read", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const conversationId = req.params.conversationId;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "ID cuộc trò chuyện không hợp lệ"
            });
        }

        const result = await messageController.markAllAsRead(conversationId, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * GET /api/messages/:conversationId
 * Get messages for a conversation
 * Query params: 
 * - limit: number (default 50)
 * - cursor: string (optional, for cursor pagination)
 */
router.get("/:conversationId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const conversationId = req.params.conversationId;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = parseInt(req.query.skip as string) || 0;
        const cursor = req.query.cursor as string;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "ID cuộc trò chuyện không hợp lệ"
            });
        }

        const result = await messageController.getMessagesByCursor(conversationId, userId, limit, cursor);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * POST /api/messages/:messageId/read
 * Mark a specific message as read
 */
router.post("/:messageId/read", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const messageId = req.params.messageId;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Message ID bắt buộc"
            });
        }

        const result = await messageController.markAsRead(messageId, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
router.delete("/:messageId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const messageId = req.params.messageId;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Message ID bắt buộc"
            });
        }

        const result = await messageController.deleteMessage(messageId, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * PUT /api/messages/:messageId
 * Edit a message
 * Body: { content: string }
 */
router.put("/:messageId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const messageId = req.params.messageId;
        const { content } = req.body;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Message ID bắt buộc"
            });
        }

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Nội dung tin nhắn bắt buộc"
            });
        }

        const result = await messageController.editMessage(messageId, userId, content);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
