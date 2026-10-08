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

  if (session.user.role !== "admin" && session.user.role !== "superadmin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
