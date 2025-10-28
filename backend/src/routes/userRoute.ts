import { Router } from "express";
import { getMe } from "../controllers/userController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Áp dụng authMiddleware cho tất cả routes
router.use(authMiddleware);

router.get("/me", getMe);

export default router;