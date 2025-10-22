import { Router } from "express";
import { signUp,signIn } from "../controllers/authController";


const router = Router();

// Đăng ký người dùng
router.post('/signup', signUp);

router.post('/login', signIn);


export default router;