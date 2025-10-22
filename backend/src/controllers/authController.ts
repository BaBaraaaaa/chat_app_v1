import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Session from "../models/Session";

const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // Thời gian sống của access token 15p
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // Thời gian sống của refresh token 7 ngày
export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin." });
    }
    //kiểm tra user đã tồn tại chưa
    const duplicateUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (duplicateUser) {
      return res.status(400).json({ message: "Người dùng đã tồn tại." });
    }
    //mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng băm

    //tạo user mới
    const newUser = new User({
      username,
      email,
      hashedPassword,
      displayName: `${firstName} ${lastName}`,
    });
    await newUser.save();
    return res.status(204).json({ message: "Đăng ký thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi khi signUp." });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body; // lấy thông tin từ req.body
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin." });
    }
    // Kiểm tra người dùng
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }
    //Nếu khớp thì tạo access Token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL }
    );
    //Tạo refresh token
    const refreshToken = crypto.getRandomValues(new Uint8Array(64)).toString();
    //tạo session mới để lưu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), //7 ngày
    });
    // trả refesh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Chỉ gửi cookie qua HTTPS kết nối
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });
    return res
      .status(200)
      .json({ message: "Đăng nhập thành công.", accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi khi signIn." });
  }
};
export const signOut = async (req: Request, res: Response) => {
  try {
    //lấy refesh token từ cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Không tìm thấy refresh token." });
    }
    //xóa refresh token khỏi db
    await Session.deleteOne({ refreshToken });
    res.clearCookie("refreshToken");
    return res.status(204).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi khi signOut." });
  }
};
