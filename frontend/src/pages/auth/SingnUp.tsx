import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return <AuthLayout eyebrow="Une plateforme au service du soin" title="Construisons un meilleur suivi des traitements." description="Un espace pour retrouver les patients, organiser les traitements et rendre visibles les difficultés qui demandent un accompagnement."><SignupForm /></AuthLayout>
}
