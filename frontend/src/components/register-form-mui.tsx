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
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import { GradientBackground, GlassCard } from "@/theme/styledComponents";
import { authService } from "@/services/authService";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
    displayName: z.string().min(1, "Tên hiển thị là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Password phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function SignupFormMui() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const [firstName, ...lastNames] = data.displayName.split(' ');
      const lastName = lastNames.join(' ') || firstName;
      
      await authService.signUp(
        data.username,
        data.password,
        data.email,
        firstName,
        lastName
      );

      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
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
                  Đăng Ký
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạo tài khoản mới để bắt đầu trò chuyện
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
                  label="Tên hiển thị"
                  margin="normal"
                  autoComplete="name"
                  error={!!errors.displayName}
                  helperText={errors.displayName?.message}
                  {...register("displayName")}
                  disabled={isLoading}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register("email")}
                  disabled={isLoading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  autoComplete="new-password"
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

                <TextField
                  fullWidth
                  label="Xác nhận Password"
                  type={showConfirmPassword ? "text" : "password"}
                  margin="normal"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
                </Button>

                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Đã có tài khoản?{" "}
                    <Link
                      to="/login"
                      style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
                    >
                      Đăng nhập ngay
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
