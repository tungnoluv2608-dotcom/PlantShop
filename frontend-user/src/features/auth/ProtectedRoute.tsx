import { Navigate, Outlet, useLocation } from "react-router"
import { useAuthStore } from "@/stores/authStore"

/**
 * Guards customer-only routes. Redirects to /signin, preserving the intended
 * destination so we can return after login.
 */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />
  }
  return <Outlet />
}
