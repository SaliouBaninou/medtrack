import { Navigate } from "react-router"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { authClient } from "@/lib/auth-client"
import { getDashboardPath } from "@/lib/auth-routing"

export default function LoginPage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="min-h-svh bg-[#f7faf9]" aria-hidden="true" />
  }

  if (session?.user) {
    return <Navigate to={getDashboardPath(session.user.role)} replace />
  }

  return <AuthLayout><LoginForm /></AuthLayout>
}
