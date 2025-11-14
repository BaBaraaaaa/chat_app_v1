import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from "@/stores/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthInit } from "@/hooks/useAuthInit";

const PublicRoute = () => {
  const { loading } = useAuthStore();
  const { isInitialized, isAuthenticated } = useAuthInit();

  if (loading || !isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
