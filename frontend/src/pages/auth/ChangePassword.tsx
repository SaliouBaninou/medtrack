import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { markDemoPasswordUpdated } from "@/lib/demo-auth"

export default function ChangePassword() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get("email") ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.")
      return
    }
    if (password === currentPassword) {
      toast.error("Choisissez un mot de passe différent de l’actuel.")
      return
    }
    markDemoPasswordUpdated(email)
    toast.success("Mot de passe modifié", { description: "La simulation de changement est enregistrée." })
    setCurrentPassword("")
    setPassword("")
    setConfirmation("")
  }

  return (
    <AuthLayout eyebrow="Sécurité du compte" title="Gardez votre compte protégé." description="Un mot de passe robuste contribue à protéger les informations de votre espace professionnel.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6"><span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><LockKeyhole className="size-5" /></span><h1 className="text-2xl font-bold tracking-tight">Modifier le mot de passe</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Saisissez votre mot de passe actuel, puis choisissez-en un nouveau.</p></div>
        <div className="space-y-2"><Label htmlFor="change-email">Adresse e-mail</Label><Input id="change-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="current-password">Mot de passe actuel</Label><Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="change-new-password">Nouveau mot de passe</Label><Input id="change-new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><p className="text-xs text-muted-foreground">8 caractères minimum.</p></div>
        <div className="space-y-2"><Label htmlFor="change-confirm-password">Confirmer le nouveau mot de passe</Label><Input id="change-confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
        <div className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-900"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Mode démo : le formulaire vérifie les champs et enregistre une simulation locale. Aucun mot de passe réel n’est changé.</div>
        <Button type="submit" className="h-10 w-full" disabled={!email || !currentPassword || password.length < 8 || !confirmation}>Enregistrer le nouveau mot de passe</Button>
        <Link to="/auth/sign-in" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Retour à la connexion</Link>
      </form>
    </AuthLayout>
  )
}
