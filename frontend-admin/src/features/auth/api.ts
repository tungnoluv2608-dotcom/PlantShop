import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAdminAuthStore } from "@/stores/adminAuthStore"
import type { AdminUser } from "@/types"
import type { LoginFormValues } from "./schema"

interface LoginResponse {
  token: string
  user: AdminUser
}

export function useAdminLogin() {
  const setSession = useAdminAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await apiClient.post<LoginResponse>("/admin/login", values)
      return data
    },
    onSuccess: (data) => {
      setSession(data.token, data.user)
    },
  })
}
