"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ message: "Không có token, truy cập bị từ chối." });
        }
        // Xác thực token hợp lệ
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Token không hợp lệ." });
        }
        const user = await User_1.default.findById({ _id: decoded.userId }).select("-hashedPassword");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        // Trả user về req
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res
                .status(401)
                .json({ message: "Token đã hết hạn, vui lòng đăng nhập lại." });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Token không hợp lệ." });
        }
        return res.status(500).json({ message: "Lỗi server nội bộ." });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map