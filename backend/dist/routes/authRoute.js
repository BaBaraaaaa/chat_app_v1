"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Đăng ký người dùng
router.post('/register', authController_1.signUp);
router.post('/login', authController_1.signIn);
router.post('/logout', authController_1.signOut);
router.post('/refresh-token', authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoute.js.map