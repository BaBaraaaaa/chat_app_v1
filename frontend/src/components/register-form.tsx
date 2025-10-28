import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  MessageCircle,
  AtSign,
  Sparkles,
  Heart,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpFormValues } from "@/utils/typeCheck";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpFormValues) => {
    console.log("Form data:", data);
    const result = await signUp(
      data.username,
      data.password,
      data.email,
      data.firstName,
      data.lastName
    );
    
    if (result.success) {
      navigate("/login");
    }
    // Lỗi đã được xử lý trong store với toast
  };

  return (
    <div
      className={cn(
        "h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 h-full flex">
        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header with Logo */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white animate-bounce"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ChatApp
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">
                    Connect & Chat
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  Tham gia cộng đồng
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Tạo tài khoản để bắt đầu cuộc trò chuyện thú vị với bạn bè
                  trên khắp thế giới
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                  >
                    Tên
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Tên"
                        {...register("firstName")}
                        className="pl-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                  >
                    Họ
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Họ"
                        {...register("lastName")}
                        className="pl-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Tên đăng nhập
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="username_unique"
                      {...register("username")}
                      className="pl-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                >
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@domain.com"
                      {...register("email")}
                      className="pl-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                  >
                    Mật khẩu
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className="pl-12 pr-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors p-1 z-10"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-bold text-gray-700 uppercase tracking-wide"
                  >
                    Xác nhận
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-200"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="pl-12 pr-12 h-14 border-2 border-gray-200/50 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90 focus:bg-white font-medium relative z-0"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors p-1 z-10"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border-0 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang tạo tài khoản...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Tạo tài khoản ngay
                    </div>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <Separator className="bg-gray-300" />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-50 to-purple-50 px-4 text-sm text-gray-500 font-bold uppercase tracking-wide">
                  Hoặc tiếp tục với
                </span>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="h-14 border-2 border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-semibold backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-14 border-2 border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 rounded-xl transition-all duration-200 font-semibold backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="text-center pt-6">
                <p className="text-gray-600">
                  Đã có tài khoản?{" "}
                  <a
                    href="/login"
                    className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 right-32 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center text-white px-12 flex items-center justify-center">
            <div className="space-y-8">
              {/* Hero Illustration */}
              <div className="relative">
                <div className="w-48 h-48 mx-auto bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <MessageCircle className="w-24 h-24 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <span className="text-2xl">🎉</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <h3 className="text-4xl font-bold leading-tight">
                  Chào mừng đến với
                  <br />
                  <span className="text-yellow-300">ChatApp Community</span>
                </h3>
                <p className="text-xl text-white/90 leading-relaxed">
                  Kết nối với hàng triệu người dùng trên khắp thế giới. Chia sẻ
                  khoảnh khắc, tạo kết nối và khám phá những trải nghiệm tuyệt
                  vời.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1M+</div>
                    <div className="text-sm text-white/80">Người dùng</div>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">10M+</div>
                    <div className="text-sm text-white/80">Tin nhắn</div>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">99%</div>
                    <div className="text-sm text-white/80">Hài lòng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
