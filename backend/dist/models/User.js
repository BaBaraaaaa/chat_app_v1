"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // xoá khoảng trắng thừa
        lowercase: true, // chuyển về chữ thường
    },
    hashedPassword: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String }, //link CDN để hiển thị hình
    avatarId: { type: String }, // cloundinary public id để xóa hình
    bio: { type: String, maxlength: 160, default: "" },
    phone: { type: String, sparse: true }, // sparse cho phép null và unique cùng tồn tại
    friends: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }], // danh sách bạn bè
}, { timestamps: true }); //tự động tạo createdAt và updatedAt
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map