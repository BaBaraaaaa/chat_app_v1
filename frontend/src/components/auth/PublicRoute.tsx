import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthInit } from "@/hooks/useAuthInit";

const PublicRoute = () => {
  const { loading } = useAuthStore();
  const { isInitialized, isAuthenticated } = useAuthInit();

  if (loading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
