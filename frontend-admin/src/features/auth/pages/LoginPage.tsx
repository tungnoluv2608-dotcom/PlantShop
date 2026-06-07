import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useLocation, Navigate } from "react-router"
import { Leaf, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAdminAuthStore } from "@/stores/adminAuthStore"
import { loginSchema, type LoginFormValues } from "../schema"
import { useAdminLogin } from "../api"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAdminLogin()
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated())

  const from = (location.state as { from?: string } | null)?.from ?? "/"

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data.user?.role !== "admin") {
          toast.error("Tài khoản không có quyền quản trị")
          useAdminAuthStore.getState().clearSession()
          return
        }
        toast.success("Đăng nhập thành công")
        navigate(from, { replace: true })
      },
      onError: (err) => toast.error(getApiErrorMessage(err, "Đăng nhập thất bại")),
    })
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Leaf className="size-5" />
          </span>
          PlantShop Admin
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold leading-tight">
            Quản trị hệ sinh thái cây xanh
          </h2>
          <p className="max-w-sm text-sidebar-foreground/70">
            Quản lý sản phẩm, đơn hàng, nội dung và khách hàng trong một bảng
            điều khiển duy nhất.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/50">
          © {new Date().getFullYear()} PlantShop. Internal use only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-5" />
              </span>
              <span className="text-lg font-semibold">PlantShop Admin</span>
            </div>
            <h1 className="text-2xl font-semibold">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Sử dụng tài khoản quản trị để tiếp tục.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={login.isPending}
              >
                {login.isPending && <Loader2 className="size-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
