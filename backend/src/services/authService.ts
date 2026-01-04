import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Session from "../models/Session";

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  /**
   * Đăng ký người dùng mới
   */
  static async signUp(params: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResponse> {
    try {
      const { username, email, password, displayName } = params;

      // Kiểm tra user đã tồn tại chưa
      const duplicateUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (duplicateUser) {
        return {
          success: false,
          message: "Người dùng đã tồn tại.",
        };
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user mới
      const newUser = new User({
        username,
        email,
        hashedPassword,
        displayName,
      });
      await newUser.save();

      return {
        success: true,
        message: "Đăng ký thành công.",
      };
    } catch (error) {
      console.error("Lỗi trong AuthService.signUp:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi đăng ký.",
        error,
      };
    }
  }

  /**
   * Đăng nhập
   */
  static async signIn(params: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const { username, password } = params;

      // Kiểm tra người dùng
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng.",
        };
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!isMatch) {
        return {
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng.",
        };
      }

      // Tạo access Token
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" } // Using string format for expiresIn as per common practice, though number (ms) is also valid if handled correctly. The original used number constant. Let's stick to consistent logic.
      );
      // Wait, original used ACCESS_TOKEN_TTL which is number in ms. But jwt.sign expiresIn with number is treated as seconds unless legacy. 
      // Actually jwt.sign(payload, secret, { expiresIn: 60 }) => 60 seconds.
      // 15 * 60 * 1000 = 900000. If passed as number, it is interpreted as seconds? No, verifying jwt docs...
      // jwt documentation: "If you want to configure the expiration time using milliseconds, please use a string format, e.g. "120ms"."
      // BUT "If payload is not a buffer or a string, it will be coerced into a string using JSON.stringify."
      // Let's re-check the original controller.
      // Original: const ACCESS_TOKEN_TTL = 15 * 60 * 1000; jwt.sign(..., { expiresIn: ACCESS_TOKEN_TTL })
      // If the original worked, it might be providing a numeric value. JWT checks: if number -> seconds.
      // 15 * 60 * 1000 = 900,000 seconds = 10.4 days! 
      // The original code might have had a bug or intention was 15 mins but actually gave 10 days. 
      // Correction: Standard practice: "15m". Let's use "15m" for safety and clarity.
      
      
      // Tạo refresh token
      // Using crypto web api might not be available in Node < 19 without global.
      // Original was: crypto.getRandomValues(new Uint8Array(64)).toString()
      // Let's import crypto from 'crypto' for Node environment if needed, or use the globalThis.crypto if available (Node 19+). 
      // Ideally use simple random string generator or uuid if available.
      // Let's try to keep it close to original but safe for Node.
      // Note: 'crypto' in Node.js global is available in Node 19+. For older, need import. 
      // To be safe, I'll use a simple random string generation or node crypto.
      
      const refreshToken = require("crypto").randomBytes(64).toString("hex");

      // Tạo session mới
      await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      });

      return {
        success: true,
        message: "Đăng nhập thành công.",
        data: {
            accessToken,
            refreshToken, // Service returns it, Controller sets cookie
            maxAge: REFRESH_TOKEN_TTL
        }
      };
    } catch (error) {
      console.error("Lỗi trong AuthService.signIn:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi đăng nhập.",
        error,
      };
    }
  }

  /**
   * Đăng xuất
   */
  static async signOut(refreshToken: string): Promise<AuthResponse> {
    try {
      await Session.deleteOne({ refreshToken });
      return {
        success: true,
        message: "Đăng xuất thành công.",
      };
    } catch (error) {
      console.error("Lỗi trong AuthService.signOut:", error);
      return {
        success: false,
        message: "Lỗi khi đăng xuất.",
        error,
      };
    }
  }

  /**
   * Refresh Token
   */
  static async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const session = await Session.findOne({ refreshToken: token });
      
      if (!session) {
        return {
          success: false,
          message: "Refresh token không hợp lệ.",
        };
      }

      if (session.expiresAt < new Date()) {
        return {
          success: false,
          message: "Refresh token đã hết hạn.",
        };
      }

      // Tạo mới access token
      // Safe fix: Use "15m" string
      const accessToken = jwt.sign(
        { userId: session.userId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" } 
      );

      return {
        success: true,
        message: "Làm mới token thành công.",
        data: { accessToken },
      };
    } catch (error) {
      console.error("Lỗi trong AuthService.refreshToken:", error);
      return {
        success: false,
        message: "Đã xảy ra lỗi khi làm mới token.",
        error,
      };
    }
  }
}
