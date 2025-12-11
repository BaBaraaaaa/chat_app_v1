"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SessionSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    refreshToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
//tự động xóa khi hết hạn
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.default = mongoose_1.default.model("Session", SessionSchema);
//# sourceMappingURL=Session.js.map