import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
  withCredentials: true,
});
//interceptor hoạt động giống như middleware, nó can thiệp vào request trước khi gửi đi và response trước khi nhận về
//gắn access token vào req header
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//tự động gọi refresh token khi access token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    //danh sách các endpoint không cần refresh token
    const excludedEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
      "/auth/logout",
    ];
    if (
      originalRequest.url.includes("/auth/refresh-token") ||
      excludedEndpoints.some((endpoint) =>
        originalRequest.url.includes(endpoint)
      )
    ) {
      return Promise.reject(error);
    }
    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
        originalRequest._retryCount += 1;
      try {
        const res = await api.post(
          "/auth/refresh-token",
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (error) {
        console.log("lỗi khi làm mới token:", error);
        useAuthStore.getState().clearState();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
export default api;
