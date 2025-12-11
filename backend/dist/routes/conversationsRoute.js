"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const conversationController_1 = require("../controllers/conversationController");
const router = (0, express_1.Router)();
const conversationController = new conversationController_1.ConversationController();
// Apply auth middleware to all conversation routes
router.use(authMiddleware_1.authMiddleware);
/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await conversationController.getUserConversations(userId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.get("/search", async (req, res) => {
    try {
        const userId = req.user.id;
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }
        const result = await conversationController.searchConversations(userId, searchQuery);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.get("/unread-count", async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await conversationController.getTotalUnreadCount(userId);
        if (result.success) {
            res.json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.get("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
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
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.post("/", async (req, res) => {
    try {
        const userId = req.user.id;
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
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.user.id;
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
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
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
router.post("/:id/read", async (req, res) => {
    try {
        const userId = req.user.id;
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
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
//# sourceMappingURL=conversationsRoute.js.map