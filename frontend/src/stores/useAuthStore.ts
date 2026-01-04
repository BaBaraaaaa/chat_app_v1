/* eslint-disable @typescript-eslint/no-unused-vars */
// src/stores/useAuthStore.ts
import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import socketService from "@/socket/socketService";
import type { AuthState } from "@/types/store";
import type { User } from "@/types/user";

export const useAuthStore = create<AuthState>((set, get) => ({
  // === STATE ===
  accessToken: null,
  user: null,
  loading: false,
  darkMode:
    typeof window !== "undefined"
      ? localStorage.getItem("darkMode") === "true"
      : false,
  hasLoggedOut:
    typeof window !== "undefined"
      ? localStorage.getItem("hasLoggedOut") === "true"
      : false,

  // === ACTIONS ===

  clearState: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasLoggedOut", "true");
    }
    socketService.logout(); // Ngắt socket sạch, không toast disconnect thừa
    set({
      accessToken: null,
      user: null,
      hasLoggedOut: true,
      loading: false,
    });
  },

  setAccessToken: (accessToken: string | null) => {
    set({ accessToken });
  },

  handleTokenRefresh: async (newToken: string) => {
    set({ accessToken: newToken });
    // Reconnect socket with new token
    socketService.disconnect();
    await socketService.connect(newToken);
  },

  signUp: async (username: string, password: string, email: string, displayName: string) => {
    try {
      set({ loading: true });
      await authService.signUp(username, password, email, displayName);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || "Đăng ký thất bại! Vui lòng thử lại.");
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username: string, password: string) => {
    try {
      set({ loading: true });

      const { accessToken } = await authService.signIn(username, password);
      get().setAccessToken(accessToken);

      const user = await authService.fetchMe();
      set({ user });

      // Reset flag logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("hasLoggedOut");
      }
      set({ hasLoggedOut: false });

      // Kết nối socket với token mới
      await socketService.connect(accessToken);

      toast.success("Đăng nhập thành công!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      set({ loading: false });
    }
  },

  // Khởi tạo auth khi mở app – KHÔNG toast lỗi nếu fail
  initializeAuth: async () => {
    const { hasLoggedOut, accessToken } = get();

    if (hasLoggedOut) return false;

    // Nếu còn accessToken cũ → thử dùng trước
    if (accessToken) {
      try {
        const user = await authService.fetchMe();
        set({ user });
        await socketService.connect(accessToken);
        return true;
      } catch {
        // Token cũ invalid → tiếp tục thử refresh
      }
    }

    // Thử refresh token qua cookie
    try {
      const newToken = await authService.refresh();
      if (!newToken) return false;

      get().setAccessToken(newToken);
      const user = await authService.fetchMe();
      set({ user });
      await socketService.connect(newToken);

      localStorage.removeItem("hasLoggedOut");
      set({ hasLoggedOut: false });

      return true;
    } catch (error) {
      console.log("Không có phiên hợp lệ để khôi phục");
      return false;
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
      return user;
    } catch (error) {
      console.error("Fetch me failed:", error);
      set({ user: null });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.darkMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("darkMode", String(newMode));
      }
      return { darkMode: newMode };
    });
  },

  updateUser: (userData: User) => {
    set({ user: userData });
  },

  updateAvatar: (avatarUrl: string | null | undefined) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, avatarUrl: avatarUrl ?? undefined } });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await authService.signOut();
      get().clearState();
      toast.success("Đăng xuất thành công!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || "Đăng xuất thất bại!");
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      const newToken = await authService.refresh();
      if (newToken) {
        get().setAccessToken(newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  },
}));