import { Router } from "express";
import { getMe, searchUsers } from "../controllers/userController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Áp dụng authMiddleware cho tất cả routes
router.use(authMiddleware);

router.get("/me", getMe);
router.get("/search", searchUsers);

export default router;