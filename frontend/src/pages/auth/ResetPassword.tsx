import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get("email") ?? ""
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }
    setIsSubmitting(true)
    const { error } = await authClient.emailOtp.resetPassword({ email, otp: code, password })
    setIsSubmitting(false)
    if (error) {
      toast.error("Réinitialisation impossible", { description: error.message })
      return
    }
    toast.success("Mot de passe modifié", { description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe." })
    navigate("/auth/sign-in", { replace: true })
  }

  return (
    <AuthLayout eyebrow="Nouveau mot de passe" title="Choisissez un mot de passe plus sûr." description="Après validation, vous pourrez vous reconnecter à votre espace MedTrack.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6"><span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><LockKeyhole className="size-5" /></span><h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1><p className="mt-2 text-sm text-muted-foreground">Saisissez le code reçu à {email} puis choisissez votre nouveau mot de passe.</p></div>
        <div className="space-y-2"><Label htmlFor="reset-code">Code reçu par e-mail</Label><Input id="reset-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" className="h-12 text-center text-xl tracking-[0.45em]" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></div>
        <div className="space-y-2"><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><p className="text-xs text-muted-foreground">8 caractères minimum.</p></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
        <div className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-900"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Le code expire après 10 minutes et ne peut être utilisé qu’une fois.</div>
        <Button type="submit" className="h-10 w-full" disabled={isSubmitting || code.length !== 6 || password.length < 8 || !confirmation}>{isSubmitting ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}</Button>
        <Link to="/auth/sign-in" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
      </form>
    </AuthLayout>
  )
}
