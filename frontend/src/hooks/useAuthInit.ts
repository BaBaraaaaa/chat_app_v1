import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export const useAuthInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken, user, hasLoggedOut, refresh, fetchMe } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      
      try {
        // Nếu có access token, kiểm tra và fetch user nếu cần
        if (accessToken && !user) {
          await fetchMe();
        } 
        // Chỉ thử refresh nếu chưa logout và không có access token
        else if (!accessToken && !user && !hasLoggedOut) {
          try {
            const token = await refresh();
            if (token) {
              await fetchMe();
            }
          } catch {
            // Nếu refresh thất bại, có nghĩa là user chưa đăng nhập
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        } else {
          // Bỏ qua khởi tạo xác thực nếu người dùng đã đăng xuất hoặc đã xác thực
          return;
        }
      } catch (error) {
        toast.error('Đã xảy ra lỗi trong quá trình khởi tạo xác thực.');
        throw error;
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []); // Chỉ chạy một lần khi component mount

  return {
    isInitialized,
    isAuthenticated: !!(accessToken && user)
  };
};