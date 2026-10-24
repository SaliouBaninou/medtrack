import { Navigate, Outlet } from "react-router"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { authClient } from "@/lib/auth-client"
import { AdminLoadingScreen } from "@/components/admin/admin-loading-screen"

export default function AdminRoute() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const showRedirectLoader = Boolean(
    (location.state as { showAdminLoader?: boolean } | null)?.showAdminLoader,
  )
  const [redirectLoaderComplete, setRedirectLoaderComplete] = useState(!showRedirectLoader)

  useEffect(() => {
    if (!showRedirectLoader) return

    const timer = window.setTimeout(() => {
      setRedirectLoaderComplete(true)
      navigate(location.pathname, { replace: true, state: null })
    }, 700)

    return () => window.clearTimeout(timer)
  }, [location.pathname, navigate, showRedirectLoader])

  if (isPending || !redirectLoaderComplete) {
    return <AdminLoadingScreen administrator />
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace />
  }

  const roles = String(session.user.role ?? "").split(",").map((role) => role.trim())
  if (!roles.includes("admin") && !roles.includes("superadmin")) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function SuperadminRoute() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <AdminLoadingScreen administrator />
  if (!session) return <Navigate to="/auth/sign-in" replace />
  const roles = String(session.user.role ?? "").split(",").map((role) => role.trim())
  if (!roles.includes("superadmin")) return <Navigate to="/admin" replace />
  return <Outlet />
}

export function AdminOnlyRoute() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <AdminLoadingScreen administrator />
  if (!session) return <Navigate to="/auth/sign-in" replace />
  const roles = String(session.user.role ?? "").split(",").map((role) => role.trim())
  if (!roles.includes("admin")) return <Navigate to="/admin" replace />
  return <Outlet />
}
