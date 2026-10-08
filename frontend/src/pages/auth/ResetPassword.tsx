import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { finishDemoOtp, hasVerifiedDemoOtp, markDemoPasswordUpdated } from "@/lib/demo-auth"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get("email") ?? ""
  const verified = hasVerifiedDemoOtp(email, "password-reset")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasVerifiedDemoOtp(email, "password-reset")) {
      toast.error("Vérification requise", { description: "Vérifiez d’abord votre adresse avec le code OTP." })
      navigate(`/auth/verifier-code?email=${encodeURIComponent(email)}&purpose=password-reset`)
      return
    }
    if (password !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }
    setIsSubmitting(true)
    markDemoPasswordUpdated(email)
    finishDemoOtp()
    toast.success("Mot de passe modifié", { description: "La simulation de réinitialisation est terminée." })
    navigate("/auth/sign-in", { replace: true })
    setIsSubmitting(false)
  }

  if (!verified) {
    return <AuthLayout eyebrow="Réinitialisation sécurisée" title="Vérifiez votre adresse avant de continuer." description="Un code OTP valide est nécessaire pour accéder à la création d’un nouveau mot de passe."><div className="space-y-5"><div><h1 className="text-2xl font-bold tracking-tight">Vérification nécessaire</h1><p className="mt-2 text-sm text-muted-foreground">Le code n’a pas été vérifié ou a expiré.</p></div><Button className="w-full" render={<Link to={`/auth/verifier-code?email=${encodeURIComponent(email)}&purpose=password-reset`} />}>Revenir au code</Button><Link to="/auth/mot-de-passe-oublie" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Recommencer</Link></div></AuthLayout>
  }

  return (
    <AuthLayout eyebrow="Nouveau mot de passe" title="Choisissez un mot de passe plus sûr." description="Après validation, vous pourrez vous reconnecter à votre espace MedTrack.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6"><span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><LockKeyhole className="size-5" /></span><h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1><p className="mt-2 text-sm text-muted-foreground">Pour le compte {email}</p></div>
        <div className="space-y-2"><Label htmlFor="new-password">Nouveau mot de passe</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><p className="text-xs text-muted-foreground">8 caractères minimum.</p></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
        <div className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-900"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Mode démo : cette action simule la modification et ne met pas à jour un mot de passe sur le serveur.</div>
        <Button type="submit" className="h-10 w-full" disabled={isSubmitting || password.length < 8 || !confirmation}>{isSubmitting ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}</Button>
        <Link to="/auth/sign-in" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
      </form>
    </AuthLayout>
  )
}
