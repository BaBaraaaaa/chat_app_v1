import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

// Đăng ký người dùng
router.post('/register', (req, res) => authController.signUp(req, res));

// Đăng nhập
router.post('/login', (req, res) => authController.signIn(req, res));

// Đăng xuất
router.post('/logout', (req, res) => authController.signOut(req, res));

// Refresh Token
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

export default router;