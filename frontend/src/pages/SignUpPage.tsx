import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Plant, Eye, EyeSlash } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { toast } from "sonner";

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
    terms: z
      .boolean()
      .refine((val) => val === true, "Bạn cần đồng ý với điều khoản"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { terms: false },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await authService.signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Đăng ký thành công!", {
        description: "Bạn có thể đăng nhập ngay bây giờ 🌱",
      });
      navigate("/signin");
    } catch (error) {
      toast.error("Đăng ký thất bại", {
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
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-foreground/70">
          Đã có tài khoản?{" "}
          <Link to="/signin" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-secondary sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Họ và tên
              </label>
              <div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  className={`${inputClasses} ${errors.name ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Địa chỉ Email
              </label>
              <div>
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
               <label 
                htmlFor="password" 
                className="block text-sm font-medium text-foreground mb-1.5"
               >
                Mật khẩu
               </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
            
            <div>
               <label 
                htmlFor="confirm-password" 
                className="block text-sm font-medium text-foreground mb-1.5"
               >
                Xác nhận mật khẩu
               </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`${inputClasses} pr-10 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "border-input"}`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start pt-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 bg-white border-input rounded text-primary focus:ring-primary cursor-pointer"
                {...register("terms")}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-foreground cursor-pointer">
                Tôi đồng ý với các <a href="#" className="text-primary hover:underline font-semibold">Điều khoản</a> và <a href="#" className="text-primary hover:underline font-semibold">Chính sách bảo mật</a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500 font-medium -mt-2">{errors.terms.message}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2 w-full shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
