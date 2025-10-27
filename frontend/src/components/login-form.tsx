import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, MessageCircle, Heart, Users, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInFormValues } from "@/utils/typeCheck";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema) });
  const navigate = useNavigate();
  const onSubmit = async (data: SignInFormValues) => {
    console.log("Sign in form submitted:", data);
    // TODO: Implement API call to /api/auth/login
    await signIn(data.username, data.password);
    navigate('/chat');
  };

  return (
    <div className={cn("h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-none bg-white/80 backdrop-blur-sm rounded-none h-full w-full">
        <CardContent className="grid p-0 lg:grid-cols-2 h-full">
          {/* Left Side - Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ChatApp
                    </h1>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Chào mừng trở lại!
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Đăng nhập để tiếp tục cuộc trò chuyện với bạn bè của bạn
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Tài khoản <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nhập tài khoản của bạn"
                      {...register("username")}
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu của bạn"
                      {...register("password")}
                      className="pl-12 pr-12 h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 font-medium">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border-0"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <Separator className="bg-gray-200" />
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500 font-medium">
                    Hoặc đăng nhập với
                  </span>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                    className="h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </Button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  Chưa có tài khoản?{" "}
                  <a
                    href="/signup"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </a>
                </p>
              </form>
            </div>

            {/* Right Side - Illustration */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative hidden lg:flex items-center justify-center p-12">
              <div className="text-center space-y-8 text-white">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse delay-2000"></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                  <div className="w-40 h-40 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
                    <MessageCircle className="w-20 h-20 text-white" />
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <h3 className="text-3xl font-bold">
                      Tiếp tục cuộc trò chuyện
                    </h3>
                    <p className="text-lg text-white/90 leading-relaxed max-w-sm mx-auto">
                      Bạn bè đang chờ bạn! Đăng nhập để không bỏ lỡ bất kỳ tin nhắn quan trọng nào.
                    </p>
                  </div>

                  {/* Feature Icons */}
                  <div className="flex justify-center space-x-8 mt-12">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto mb-2">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-white/80">Tình bạn</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto mb-2">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-white/80">Nhóm chat</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto mb-2">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm text-white/80">Thú vị</p>
                    </div>
                  </div>

                  {/* Welcome Back Stats */}
                  <div className="flex justify-center space-x-8 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-sm text-white/80">Tin nhắn mới</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-white/80">Bạn bè online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-sm text-white/80">Nhóm hoạt động</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}