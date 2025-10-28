import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatAppPage from "./pages/ChatAppPage";
import { Toaster } from "sonner";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import PublicRoute from "./components/auth/PublicRoute";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<SignInPage />} />
            <Route path="/register" element={<SignUpPage />} />
          </Route>

          {/* Private routes */}
          <Route element={<ProtectedRouter />}>
            <Route path="/chat" element={<ChatAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
