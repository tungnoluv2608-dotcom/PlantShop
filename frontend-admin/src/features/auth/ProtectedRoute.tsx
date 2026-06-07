import { Navigate, Outlet, useLocation } from "react-router"
import { useAdminAuthStore } from "@/stores/adminAuthStore"

/** Guards admin routes — redirects to /login when no admin session exists. */
export function ProtectedRoute() {
  const location = useLocation()
  const token = useAdminAuthStore((s) => s.token)
  const user = useAdminAuthStore((s) => s.user)

  const isAdmin = Boolean(token) && user?.role === "admin"

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
