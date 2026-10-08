import { authClient } from "@/lib/auth-client"
import { Navigate, Outlet } from "react-router"
import { AdminLoadingScreen } from "@/components/admin/admin-loading-screen"

export default function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <AdminLoadingScreen />
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace />
  }

  return <Outlet />
}
