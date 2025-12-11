"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Áp dụng authMiddleware cho tất cả routes
router.use(authMiddleware_1.authMiddleware);
router.get("/me", userController_1.getMe);
router.get("/search", userController_1.searchUsers);
exports.default = router;
//# sourceMappingURL=userRoute.js.map