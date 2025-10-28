import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

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
            console.log('❌ Làm mới token thất bại, người dùng chưa đăng nhập');
          }
        } else {
          console.log('⏭️ Bỏ qua khởi tạo xác thực - người dùng đã đăng xuất hoặc đã xác thực');
        }
      } catch (error) {
        console.log('❌ Khởi tạo xác thực thất bại:', error);
      } finally {
        console.log('✅ Khởi tạo xác thực hoàn tất');
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