import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowLeft, KeyRound, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function VerifyCode() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get("email") ?? ""
  const [code, setCode] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code })
    if (error) {
      toast.error("Code invalide", { description: error.message })
      return
    }
    toast.success("Adresse confirmée", { description: "Votre adresse e-mail est vérifiée." })
    navigate("/auth/sign-in", { replace: true })
  }

  async function resendCode() {
    if (!email) return
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" })
    if (error) toast.error("Envoi impossible", { description: error.message })
    else toast.success("Nouveau code envoyé", { description: "Vérifiez votre boîte de réception." })
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
        <p className="text-xs text-muted-foreground">Le code envoyé par e-mail est valable 10 minutes.</p>
        <Button type="submit" className="h-10 w-full" disabled={code.length !== 6}>Vérifier le code</Button>
        <button type="button" onClick={resendCode} className="mx-auto flex items-center gap-2 text-sm font-medium text-primary hover:underline"><RefreshCw className="size-3.5" /> Générer un nouveau code</button>
        <Link to="/auth/sign-up" className="mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4" /> Retour à l’inscription</Link>
      </form>
    </AuthLayout>
  )
}
