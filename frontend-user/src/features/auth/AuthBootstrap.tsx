import { useEffect } from "react"
import { fetchCurrentUser } from "./api"
import { useAuthStore } from "@/stores/authStore"

/**
 * On app boot, if a persisted token exists, refresh the current user from
 * /auth/me. Clears the session if the token is no longer valid.
 */
export function AuthBootstrap() {
  useEffect(() => {
    const { token, setUser, clearSession } = useAuthStore.getState()
    if (!token) return
    fetchCurrentUser()
      .then(setUser)
      .catch(() => clearSession())
  }, [])
  return null
}
