import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { useWishlistStore } from "@/stores/wishlistStore"

interface AuthState {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

/**
 * Customer auth — client-only state (token + user). Persisted to localStorage
 * under `plantweb-auth`. Server data is never stored here.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        useWishlistStore.getState().clear()
        set({ token, user })
      },
      setUser: (user) => set({ user }),
      clearSession: () => {
        set({ token: null, user: null })
        useWishlistStore.getState().clear()
      },
      isAuthenticated: () => Boolean(get().token),
    }),
    { name: "plantweb-auth" },
  ),
)
