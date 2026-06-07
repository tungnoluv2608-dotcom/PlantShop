import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/api-client"
import { useAuthStore } from "@/stores/authStore"
import { AuthShell } from "../components/AuthShell"
import { GoogleAuthButton } from "../components/GoogleAuthButton"
import { useSignUp } from "../api"
import { signUpSchema, type SignUpValues } from "../schema"

export function SignUpPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const signUp = useSignUp()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = (values: SignUpValues) => {
    signUp.mutate(values, {
      onSuccess: (data) => {
        setSession(data.token, data.user)
        toast.success("Tạo tài khoản thành công")
        navigate("/", { replace: true })
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tham gia PlantWeb để mua sắm và nhận tư vấn"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ban@email.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={signUp.isPending}>
            {signUp.isPending ? "Đang tạo..." : "Đăng ký"}
          </Button>
        </form>
      </Form>
      <GoogleAuthButton onSuccess={() => navigate("/", { replace: true })} />
    </AuthShell>
  )
}
