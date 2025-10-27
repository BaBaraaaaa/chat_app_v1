import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouter = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const init = async () => {
      let token = accessToken;
      
      // Nếu không có token, thử refresh để lấy token mới
      if (!token) {
        token = await refresh();
      }
      
      // Chỉ gọi fetchMe khi có token và chưa có user
      if (token && !user) {
        await fetchMe();
      }
      
      setStarting(false);
    };
    init();
  }, [accessToken, user, refresh, fetchMe]);

  if (loading || starting) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouter;
