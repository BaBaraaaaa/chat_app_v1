import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
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
        message: "otherUserId is required"
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
      message: "Internal server error",
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
        message: "Conversation ID is required"
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
      message: "Internal server error",
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
        message: "Conversation ID is required"
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
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
