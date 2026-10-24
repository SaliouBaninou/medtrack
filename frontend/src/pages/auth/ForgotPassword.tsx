import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, Mail, Send } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const normalizedEmail = email.trim().toLowerCase()
    const { error } = await authClient.emailOtp.requestPasswordReset({ email: normalizedEmail })
    setIsSubmitting(false)
    if (error) {
      toast.error("Demande impossible", { description: error.message })
      return
    }
    toast.success("E-mail envoyé", { description: "Si un compte correspond à cette adresse, un code de réinitialisation vous sera envoyé." })
    navigate(`/auth/nouveau-mot-de-passe?email=${encodeURIComponent(normalizedEmail)}`)
  }

  return (
    <AuthLayout eyebrow="Récupération du compte" title="Retrouvez l’accès à votre espace." description="Nous allons vérifier votre adresse e-mail avant de vous laisser choisir un nouveau mot de passe.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><Mail className="size-5" /></span>
          <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié ?</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Saisissez l’adresse liée à votre compte. Vous recevrez un code pour continuer.</p>
        </div>
        <div className="space-y-2"><Label htmlFor="forgot-email">Adresse e-mail</Label><Input id="forgot-email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-3 text-xs leading-5 text-teal-900">Un code à usage unique sera envoyé à cette adresse. Il est valable 10 minutes.</div>
        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>{isSubmitting ? "Préparation…" : <>Continuer <Send /></>}</Button>
        <Link to="/auth/sign-in" className="mx-auto flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
      </form>
    </AuthLayout>
  )
}
