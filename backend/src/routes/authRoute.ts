import { Router } from "express";
import { signUp,signIn, signOut, refreshToken } from "../controllers/authController";


const router = Router();

// Đăng ký người dùng
router.post('/register', signUp);

router.post('/login', signIn);

router.post('/logout', signOut);

router.post('/refresh-token', refreshToken);

export default router;