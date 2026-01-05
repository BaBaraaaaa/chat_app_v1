import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  /**
   * Đăng ký người dùng
   */
  async signUp(req: Request, res: Response) {
    try {
      const { username, email, password, displayName } = req.body;
      
      if (!username || !email || !password || !displayName) {
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
      }

      const result = await AuthService.signUp({
        username,
        email,
        password,
        displayName
      });

      if (result.success) {
        return res.status(201).json(result); // 201 Created
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi đăng ký." });
    }
  }

  /**
   * Đăng nhập
   */
  async signIn(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng điền đầy đủ thông tin." });
      }

      const result = await AuthService.signIn({ username, password });

      if (result.success && result.data) {
        const { refreshToken, maxAge, accessToken } = result.data;

        // Set Cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure in production
          sameSite: "none", // Adjust based on requirements
          maxAge: maxAge,
        });

        // Return Access Token (without refresh token in body)
        return res.status(200).json({
          success: true,
          message: result.message,
          accessToken // Client stores this in memory
        });
      } else {
        return res.status(401).json(result);
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi đăng nhập." });
    }
  }

  /**
   * Đăng xuất
   */
  async signOut(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Không tìm thấy refresh token." });
      }

      const result = await AuthService.signOut(refreshToken);

      // Luôn clear cookie dù thành công hay thất bại ở DB để client sạch sẽ
      res.clearCookie("refreshToken");

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi đăng xuất." });
    }
  }

  /**
   * Làm mới Access Token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

      const result = await AuthService.refreshToken(refreshToken);

      if (result.success) {
        return res.status(200).json(result.data); // Return new access token
      } else {
        return res.status(403).json(result); // Forbidden if token invalid/expired
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: "Lỗi Server khi refresh token." });
    }
  }
}
