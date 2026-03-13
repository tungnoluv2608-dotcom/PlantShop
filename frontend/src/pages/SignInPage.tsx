import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Plant, Eye, EyeSlash } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.signIn({ email: data.email, password: data.password });
      setAuth(response.user, response.token);
      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng bạn quay lại, ${response.user.name} 🌿`,
      });
      navigate("/");
    } catch (error) {
      toast.error("Đăng nhập thất bại", {
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <div className="absolute top-8 left-8">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-primary/80 hover:text-primary transition-colors font-medium text-sm"
        >
          <ArrowLeft size={20} />
          Về trang chủ
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-lg">
            <Plant size={40} weight="fill" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-foreground tracking-tight">
          Đăng nhập vào PlantWeb
        </h2>
        <p className="mt-2 text-center text-sm text-foreground/70">
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-secondary sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-foreground mb-2"
              >
                Địa chỉ Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`${inputClasses} ${errors.email ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                 <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-foreground"
                 >
                  Mật khẩu
                 </label>
                 <Link to="#" className="text-xs font-semibold text-primary hover:text-primary/80">Quên mật khẩu?</Link>
               </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputClasses} pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-white border-input rounded text-primary focus:ring-primary cursor-pointer"
                {...register("rememberMe")}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2 w-full shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-border rounded-md shadow-sm bg-white text-sm font-medium text-foreground hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-border rounded-md shadow-sm bg-white text-sm font-medium text-foreground hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="h-5 w-5" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}