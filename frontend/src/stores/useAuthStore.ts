import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/type/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
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
    } catch (error) {
      console.log(error);
      toast.error("Đăng ký thất bại! Vui lòng thử lại.");
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
      get().clearState();
      set({ loading: true });
      await authService.signOut();
      toast.success("Đăng xuất thành công");
    } catch (error) {
      console.log(error);
      toast.error("Đăng xuất thất bại! Vui lòng thử lại.");
    } finally {
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
