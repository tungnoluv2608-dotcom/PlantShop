import { Link, useLocation, useNavigate } from "react-router"
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
import { useSignIn } from "../api"
import { signInSchema, type SignInValues } from "../schema"

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/"
  const setSession = useAuthStore((s) => s.setSession)
  const signIn = useSignIn()

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: SignInValues) => {
    signIn.mutate(values, {
      onSuccess: (data) => {
        setSession(data.token, data.user)
        toast.success("Đăng nhập thành công")
        navigate(from, { replace: true })
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  return (
    <AuthShell
      title="Đăng nhập"
      description="Chào mừng trở lại với PlantWeb"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </Form>
      <GoogleAuthButton onSuccess={() => navigate(from, { replace: true })} />
    </AuthShell>
  )
}
