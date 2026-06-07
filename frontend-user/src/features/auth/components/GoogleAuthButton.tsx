import { GoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"
import { env } from "@/config/env"
import { getApiErrorMessage } from "@/lib/api-client"
import { useGoogleLogin } from "../api"
import { useAuthStore } from "@/stores/authStore"

interface GoogleAuthButtonProps {
  onSuccess: () => void
}

export function GoogleAuthButton({ onSuccess }: GoogleAuthButtonProps) {
  const setSession = useAuthStore((s) => s.setSession)
  const googleLogin = useGoogleLogin()

  if (!env.googleClientId) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(res) => {
            if (!res.credential) return
            googleLogin.mutate(res.credential, {
              onSuccess: (data) => {
                setSession(data.token, data.user)
                onSuccess()
              },
              onError: (err) => toast.error(getApiErrorMessage(err)),
            })
          }}
          onError={() => toast.error("Đăng nhập Google thất bại")}
        />
      </div>
    </div>
  )
}
