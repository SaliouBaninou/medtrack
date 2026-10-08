import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowLeft, KeyRound, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { startDemoOtp, verifyDemoOtp, type DemoOtpPurpose } from "@/lib/demo-auth"

export default function VerifyCode() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get("email") ?? ""
  const purpose: DemoOtpPurpose = params.get("purpose") === "verification" ? "verification" : "password-reset"
  const [code, setCode] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = verifyDemoOtp(email, code, purpose)
    if (!result.ok) {
      toast.error("Code invalide", { description: result.reason })
      return
    }
    if (purpose === "verification") {
      toast.success("Adresse confirmée (démo)", { description: "La simulation de vérification est terminée." })
      navigate("/auth/sign-in", { replace: true })
    } else {
      navigate(`/auth/nouveau-mot-de-passe?email=${encodeURIComponent(email)}`)
    }
  }

  function resendCode() {
    if (!email) return
    startDemoOtp(email, purpose)
    toast.success("Nouveau code généré", { description: "Utilisez le code de démonstration affiché ci-dessous." })
  }

  return (
    <AuthLayout eyebrow="Vérification par e-mail" title="Une étape de vérification pour protéger votre compte." description="La vérification confirme que vous avez accès à l’adresse e-mail associée au compte.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><KeyRound className="size-5" /></span>
          <h1 className="text-2xl font-bold tracking-tight">Vérifiez votre e-mail</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Entrez le code à 6 chiffres pour <span className="font-medium text-foreground">{email || "votre adresse e-mail"}</span>.</p>
        </div>
        <div className="space-y-2"><Label htmlFor="otp-code">Code de vérification</Label><Input id="otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" className="h-12 text-center text-xl tracking-[0.45em]" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><p className="text-xs font-medium uppercase tracking-wide text-amber-800">Code de démonstration</p><p className="mt-1 font-mono text-xl font-bold tracking-[0.25em]">246810</p><p className="mt-1 text-xs text-amber-800">Valable 10 minutes · aucun e-mail réel n’est envoyé.</p></div>
        <Button type="submit" className="h-10 w-full" disabled={code.length !== 6}>Vérifier le code</Button>
        <button type="button" onClick={resendCode} className="mx-auto flex items-center gap-2 text-sm font-medium text-primary hover:underline"><RefreshCw className="size-3.5" /> Générer un nouveau code</button>
        <Link to={purpose === "verification" ? "/auth/sign-up" : "/auth/mot-de-passe-oublie"} className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4" /> Retour</Link>
      </form>
    </AuthLayout>
  )
}
