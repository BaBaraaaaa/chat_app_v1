import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/type/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

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
      set({ accessToken });
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.log(error);
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      set({ loading: false });
    }
  },
}));
