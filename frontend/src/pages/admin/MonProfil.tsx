import { useEffect, useState, type FormEvent } from "react"
import { ArrowLeft, AtSign, BadgeCheck, CalendarDays, Camera, KeyRound, Loader2, Save, ShieldCheck, UserRound } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : (parts[0]?.slice(0, 2) || "U").toUpperCase()
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Non renseignée"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Non renseignée"
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date)
}

export default function MonProfil() {
  const { data: session, isPending, error } = authClient.useSession()
  const user = session?.user
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(user?.name ?? "")
    setImage(user?.image ?? "")
  }, [user?.name, user?.image])

  const hasChanges = name.trim() !== (user?.name ?? "") || image.trim() !== (user?.image ?? "")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide.")
      return
    }

    setIsSaving(true)
    try {
      const { error: updateError } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || "",
      })
      if (updateError) throw new Error(updateError.message)
      toast.success("Profil mis à jour", { description: "Vos modifications ont bien été enregistrées." })
    } catch (cause) {
      toast.error("La mise à jour a échoué", {
        description: cause instanceof Error ? cause.message : "Veuillez réessayer.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isPending) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil indisponible</CardTitle>
            <CardDescription>Impossible de charger les informations de votre compte. Actualisez la page ou reconnectez-vous.</CardDescription>
          </CardHeader>
          <CardContent><Button render={<Link to="/admin" />}>Retour au tableau de bord</Button></CardContent>
        </Card>
      </main>
    )
  }

  const role = (user as typeof user & { role?: string | null }).role

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" render={<Link to="/admin" />}>
            <ArrowLeft className="size-4" /> Retour au tableau de bord
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Mon profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consultez et modifiez les informations de votre compte.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link to={`/auth/changer-mot-de-passe?email=${encodeURIComponent(user.email)}`} />}>
            <KeyRound className="size-4" /> Modifier le mot de passe
          </Button>
          <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5 capitalize">
            <ShieldCheck className="size-3.5 text-primary" /> {role || "Utilisateur"}
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar className="size-20 rounded-2xl border shadow-sm">
            <AvatarImage src={image || undefined} alt={name || user.name} />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-semibold text-primary">{initials(name || user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold tracking-tight">{user.name}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5"><AtSign className="size-3" />Compte MedTrack</Badge>
              {user.emailVerified && <Badge variant="secondary" className="gap-1.5 text-emerald-700 dark:text-emerald-400"><BadgeCheck className="size-3" />E-mail vérifié</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:self-end">
            <CalendarDays className="size-4" /> Membre depuis le {formatDate((user as typeof user & { createdAt?: Date | string }).createdAt)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Informations personnelles</CardTitle>
            <CardDescription>Modifiez le nom affiché et la photo de votre compte.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nom complet</Label>
                <Input id="profile-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Adresse e-mail</Label>
                <Input id="profile-email" type="email" value={user.email} readOnly disabled />
                <p className="text-xs text-muted-foreground">L’adresse e-mail ne peut pas être modifiée depuis cette page.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-image">Photo de profil (URL)</Label>
                <div className="relative">
                  <Camera className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="profile-image" type="url" placeholder="https://exemple.com/photo.jpg" value={image} onChange={(event) => setImage(event.target.value)} className="pl-9" />
                </div>
                <p className="text-xs text-muted-foreground">Saisissez l’adresse d’une image accessible publiquement. Laissez vide pour utiliser vos initiales.</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" disabled={!hasChanges || isSaving} onClick={() => { setName(user.name); setImage(user.image ?? "") }}>Annuler</Button>
                <Button type="submit" disabled={!hasChanges || isSaving}>
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Votre compte</CardTitle>
            <CardDescription>Informations liées à votre accès MedTrack.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Rôle</p><p className="text-sm font-medium capitalize">{role || "Utilisateur"}</p></div>
            <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Adresse e-mail</p><p className="break-all text-sm font-medium">{user.email}</p></div>
            <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Statut e-mail</p><p className="text-sm font-medium">{user.emailVerified ? "Vérifiée" : "Non vérifiée"}</p></div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
