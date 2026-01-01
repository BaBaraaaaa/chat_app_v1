import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import PublicRoute from "./components/auth/PublicRoute";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "./stores/useAuthStore";

// Lazy load pages for code splitting
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ChatAppPage = lazy(() => import("./pages/ChatAppPage"));
const ThemeTestPage = lazy(() => import("./pages/ThemeTestPage"));

// Full screen loading khi đang khởi tạo auth
const AppLoadingScreen = () => (
  <Backdrop
    open={true}
    sx={{ zIndex: 9999, backgroundColor: "background.default" }}
  >
    <CircularProgress size={60} thickness={5} />
  </Backdrop>
);
// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Không cần xử lý – initializeAuth đã xử lý im lặng
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [initializeAuth]);

  // Trong lúc đang kiểm tra phiên đăng nhập → hiện full loading đẹp
  if (isInitializing) {
    return <AppLoadingScreen />;
  }
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/chat" replace />} />

            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<SignInPage />} />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/theme-test" element={<ThemeTestPage />} />
            </Route>

            {/* Private routes */}
            <Route element={<ProtectedRouter />}>
              <Route path="/chat" element={<ChatAppPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
