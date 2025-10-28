import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/type/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,
  hasLoggedOut:
    typeof window !== "undefined"
      ? localStorage.getItem("hasLoggedOut") === "true"
      : false,

  clearState: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasLoggedOut", "true");
    }
    set({ accessToken: null, user: null, loading: false, hasLoggedOut: true });
  },
  setAccessToken: (accessToken: string | null) => {
    set({ accessToken });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });
      //gọi api
      await authService.signUp(username, password, email, firstName, lastName);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true };
    } catch (error) {
      console.log(error);
      toast.error("Đăng ký thất bại! Vui lòng thử lại.");
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (username, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(username, password);
      get().setAccessToken(accessToken);
      await get().fetchMe();
      if (typeof window !== "undefined") {
        localStorage.removeItem("hasLoggedOut");
      }
      set({ hasLoggedOut: false }); // Reset logout flag khi đăng nhập thành công
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.log(error);
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true });
      await authService.signOut();
    } catch (error) {
      console.log(error);
      toast.error("Đăng xuất thất bại! Vui lòng thử lại.");
    } finally {
      get().clearState();
      toast.success("Đăng xuất thành công");
      set({ loading: false });
    }
  },
  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();
      set({ user });
    } catch (error) {
      console.log(error);
      set({ user: null });
      toast.error("Lấy thông tin người dùng thất bại! Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    const { hasLoggedOut } = get();
    if (hasLoggedOut) {
      console.log("Người dùng đã đăng xuất, không làm mới token");
      return null;
    }
    try {
      set({ loading: true });
      const accessToken = await authService.refresh();
      get().setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      console.log(error);
      get().clearState();
      toast.error("Phiên đã hết hạn! Vui lòng đăng nhập lại.");
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
