import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import PublicRoute from "./components/auth/PublicRoute";
import { Box, CircularProgress } from "@mui/material";

// Lazy load pages for code splitting
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ChatAppPage = lazy(() => import("./pages/ChatAppPage"));
const ThemeTestPage = lazy(() => import("./pages/ThemeTestPage"));

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
