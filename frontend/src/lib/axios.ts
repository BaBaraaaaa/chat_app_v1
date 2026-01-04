// src/services/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner"; // Thêm import này

const api = axios.create({
  baseURL:
    import.meta.env.VITE_NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Request interceptor: gắn access token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto refresh khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const excludedEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
      "/auth/logout",
    ];

    const isExcluded = excludedEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    // Chỉ xử lý lỗi 401 hoặc 403, chưa retry, không phải endpoint loại trừ
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !isExcluded
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post("/auth/refresh-token");
        const newAccessToken = res.data.accessToken;

        // Cập nhật token mới và reconnect socket
        await useAuthStore.getState().handleTokenRefresh(newAccessToken);

        // Retry request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → kiểm tra xem trước đó có đang đăng nhập không
        const { user } = useAuthStore.getState();

        if (user) {
          // Chỉ toast khi người dùng đang hoạt động thật sự (đã có user trước khi lỗi)
          toast.error("Phiên đã hết hạn! Vui lòng đăng nhập lại.");
        }

        // Luôn clear state (logout client-side)
        useAuthStore.getState().clearState();

        return Promise.reject(refreshError);
      }
    }

    // Các lỗi khác (400, 500, network error,...) → để component handle
    return Promise.reject(error);
  }
);

export default api;