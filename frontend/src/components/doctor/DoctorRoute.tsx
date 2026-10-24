import { Navigate, Outlet } from "react-router"
import { authClient } from "@/lib/auth-client"
import { AdminLoadingScreen } from "@/components/admin/admin-loading-screen"

export default function DoctorRoute() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <AdminLoadingScreen administrator />
  if (!session) return <Navigate to="/auth/sign-in" replace />
  const roles = String(session.user.role ?? "").split(",").map((role) => role.trim())
  if (!roles.includes("medecin")) return <Navigate to={roles.includes("admin") || roles.includes("superadmin") ? "/admin" : "/"} replace />
  return <Outlet />
}
