import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AdminUser } from "@/types"

interface AdminAuthState {
  token: string | null
  user: AdminUser | null
  setSession: (token: string, user: AdminUser) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: "pap-admin-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
