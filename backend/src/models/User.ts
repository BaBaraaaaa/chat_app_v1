import mongoose from "mongoose";
import { Document } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  hashedPassword: string;
  displayName: string;
  bio: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  phone?: string | null;
}
const userSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
); //tự động tạo createdAt và updatedAt

const User = mongoose.model("User", userSchema);

export default User;
