import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { GradientBackground, GlassCard } from "@/theme/styledComponents";
import { useAuthStore } from "@/stores/useAuthStore";

const loginSchema = z.object({
  username: z.string().min(1, "Username là bắt buộc"),
  password: z.string().min(1, "Password là bắt buộc"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function SigninFormMui() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(data.username, data.password);
      navigate("/chat");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 4,
          }}
        >
          <GlassCard elevation={6}>
            <Box sx={{ p: { xs: 3, sm: 5 } }}>
              {/* Header */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontSize: { xs: "2rem", sm: "2.5rem" }, 
                    mb: 1,
                    background: (theme) => theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  Đăng Nhập
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <TextField
                  fullWidth
                  label="Username"
                  margin="normal"
                  autoComplete="username"
                  autoFocus
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  {...register("username")}
                  disabled={isLoading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register("password")}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tài khoản?{" "}
                    <Link
                      to="/register"
                      style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
                    >
                      Đăng ký ngay
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </GlassCard>
        </Box>
      </Container>
    </GradientBackground>
  );
}
