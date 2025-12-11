import { Router } from "express";
import { getMe, searchUsers, updateProfile, uploadAvatar, deleteAvatar } from "../controllers/userController";
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadAvatar as uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

// Áp dụng authMiddleware cho tất cả routes
router.use(authMiddleware);

router.get("/me", getMe);
router.get("/search", searchUsers);
router.put("/profile", updateProfile);
router.post("/avatar", uploadMiddleware, uploadAvatar);
router.delete("/avatar", deleteAvatar);

export default router;