import * as React from "react"
import { Ban, ChevronLeft, ChevronRight, Loader2, Pencil, Search, ShieldCheck, Stethoscope, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateDoctor, useDeleteDoctor, useDoctorAccountSearch, useDoctors, useSetDoctorBan, useUpdateDoctor, type Doctor, type DoctorAccountMatch } from "@/hooks/use-doctors"

const statusLabels = { active: "Actif", inactive: "Inactif", suspended: "Suspendu" } as const

export default function Doctors() {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [emailSearch, setEmailSearch] = React.useState("")
  const [selectedAccount, setSelectedAccount] = React.useState<DoctorAccountMatch | null>(null)
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null)
  const [specialty, setSpecialty] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [professionalId, setProfessionalId] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "inactive" | "suspended">("active")

  const query = useDoctors(page, 10, search)
  const accountQuery = useDoctorAccountSearch(emailSearch.trim())
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const setDoctorBan = useSetDoctorBan()
  const deleteDoctor = useDeleteDoctor()
  const doctors = query.data?.doctors ?? []
  const total = query.data?.pagination.totalItems ?? doctors.length
  const totalPages = Math.max(query.data?.pagination.totalPages ?? 1, 1)

  const resetForm = () => {
    setDialogOpen(false)
    setEmailSearch("")
    setSelectedAccount(null)
    setEditingDoctor(null)
    setSpecialty("")
    setDepartment("")
    setProfessionalId("")
    setPhone("")
    setStatus("active")
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAccount && !editingDoctor) return
    try {
      const profile = {
        specialty,
        department,
        professionalId: professionalId.trim() || undefined,
        phone: phone.trim() || undefined,
        status,
      }
      if (editingDoctor) {
        await updateDoctor.mutateAsync({ id: editingDoctor.id, ...profile })
        toast.success("Profil médecin modifié")
      } else if (selectedAccount) {
        await createDoctor.mutateAsync({ userId: selectedAccount.id, ...profile })
        toast.success("Médecin ajouté", { description: `${selectedAccount.name} est associé à ${query.data?.etablissement?.name ?? "votre établissement"}.` })
      }
      resetForm()
    } catch (error) {
      toast.error("Création impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }

  const editDoctor = (doctor: Doctor) => { setEditingDoctor(doctor); setSelectedAccount(null); setSpecialty(doctor.specialty); setDepartment(doctor.department); setProfessionalId(doctor.professionalId ?? ""); setPhone(doctor.phone ?? ""); setStatus(doctor.status); setDialogOpen(true) }
  const toggleBan = async (doctor: Doctor) => { try { await setDoctorBan.mutateAsync({ id: doctor.id, banned: !doctor.user.banned }); toast.success(doctor.user.banned ? "Compte médecin réactivé" : "Compte médecin suspendu") } catch (error) { toast.error("Action impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." }) } }
  const removeDoctor = async (doctor: Doctor) => { if (!window.confirm(`Supprimer le profil médecin de ${doctor.user.name} ? Le compte utilisateur sera conservé.`)) return; try { await deleteDoctor.mutateAsync(doctor.id); toast.success("Profil médecin supprimé") } catch (error) { toast.error("Suppression impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." }) } }

  return <div className="w-full animate-in space-y-6 px-4 py-6 fade-in duration-300 md:px-8 lg:px-10">
    <div className="sticky top-0 z-20 -mx-4 space-y-4 border-b border-border/40 bg-background/95 px-4 pb-5 pt-2 shadow-xs backdrop-blur-md md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Médecins</h1><p className="mt-1 text-sm text-muted-foreground">Équipe médicale de {query.data?.etablissement?.name ?? "mon établissement"}. Les médecins créés ici restent rattachés à cet hôpital.</p></div><Button onClick={() => setDialogOpen(true)} className="self-start"><UserPlus className="mr-2 size-4" />Ajouter un médecin</Button></div>
      <Card className="max-w-xs border-border/50"><CardContent className="flex items-center gap-3 p-3.5"><span className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300"><Stethoscope className="size-4" /></span><div><p className="text-xs text-muted-foreground">Médecins de l’établissement</p><p className="text-xl font-bold">{query.isLoading ? "—" : total}</p></div></CardContent></Card>
    </div>

    <Card className="overflow-hidden rounded-xl border-border/60"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Annuaire médical</h2><p className="text-xs text-muted-foreground">Rechercher par nom, e-mail, spécialité, service ou identifiant professionnel.</p></div><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher un médecin…" className="pl-9" /></div></div>
      {query.isError ? <div className="p-10 text-center"><p className="font-medium">Impossible de charger les médecins</p><p className="mt-1 text-sm text-muted-foreground">{query.error instanceof Error ? query.error.message : "Vérifiez la connexion à l’API."}</p><Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>Réessayer</Button></div> : <Table><TableHeader><TableRow><TableHead className="pl-5">Médecin</TableHead><TableHead>Spécialité</TableHead><TableHead>Département</TableHead><TableHead>Identifiant professionnel</TableHead><TableHead>Téléphone</TableHead><TableHead>Statut</TableHead><TableHead className="pr-6 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead></TableRow></TableHeader><TableBody>{query.isLoading ? Array.from({ length: 5 }).map((_, row) => <TableRow key={row}>{Array.from({ length: 7 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-4 w-28" /></TableCell>)}</TableRow>) : doctors.length === 0 ? <TableRow><TableCell colSpan={7} className="h-36 text-center"><Stethoscope className="mx-auto mb-2 size-8 text-muted-foreground/50" /><p className="font-medium">Aucun médecin trouvé</p><p className="mt-1 text-sm text-muted-foreground">{search ? "Essayez un autre filtre." : "Ajoutez le premier médecin de votre établissement."}</p>{!search && <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>Ajouter un médecin</Button>}</TableCell></TableRow> : doctors.map((doctor) => <TableRow key={doctor.id} className="group"><TableCell className="pl-5"><p className="font-semibold">{doctor.user.name}</p><p className="text-xs text-muted-foreground">{doctor.user.email}</p></TableCell><TableCell><Badge variant="secondary" className="font-normal">{doctor.specialty}</Badge></TableCell><TableCell className="text-sm">{doctor.department}</TableCell><TableCell className="text-sm">{doctor.professionalId || "—"}</TableCell><TableCell className="text-sm">{doctor.phone || "—"}</TableCell><TableCell><Badge variant={doctor.status === "active" ? "secondary" : "outline"}>{statusLabels[doctor.status]}</Badge>{doctor.user.banned && <Badge variant="destructive" className="ml-1">Banni</Badge>}</TableCell><TableCell className="py-3.5 pr-6 text-right"><div className="flex items-center justify-end gap-1 opacity-90 transition-opacity group-hover:opacity-100"><Button variant="ghost" size="icon" title="Modifier les informations" aria-label="Modifier le médecin" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => editDoctor(doctor)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title={doctor.user.banned ? "Réactiver le compte" : "Bannir le compte"} aria-label={doctor.user.banned ? "Réactiver le compte médecin" : "Bannir le compte médecin"} className={`h-8 w-8 rounded-lg ${doctor.user.banned ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300" : "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"}`} disabled={setDoctorBan.isPending} onClick={() => void toggleBan(doctor)}>{doctor.user.banned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</Button><Button variant="ghost" size="icon" title="Supprimer ce médecin" aria-label="Supprimer le profil médecin" className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300" onClick={() => void removeDoctor(doctor)}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}
      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{total ? `Affichage ${(page - 1) * 10 + 1}–${Math.min(page * 10, total)} sur ${total} médecin${total > 1 ? "s" : ""}` : "0 médecin"}</span><div className="flex items-center justify-end gap-2"><span className="mr-2 whitespace-nowrap">Page {page} sur {totalPages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" disabled={page <= 1 || query.isLoading} onClick={() => setPage((current) => current - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" disabled={page >= totalPages || query.isLoading} onClick={() => setPage((current) => current + 1)}><ChevronRight /></Button></div></div>
    </Card>

    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true) }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{editingDoctor ? "Modifier le médecin" : "Ajouter un médecin"}</DialogTitle><DialogDescription>{editingDoctor ? `Modifiez le profil de ${editingDoctor.user.name}.` : "Recherchez un compte existant par e-mail et complétez le profil médical. L’hôpital est défini à partir de votre compte administrateur."}</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="space-y-4">{!editingDoctor && <div className="space-y-2"><Label htmlFor="doctor-account-email">E-mail du compte</Label><Input id="doctor-account-email" type="email" autoComplete="off" value={selectedAccount?.email ?? emailSearch} onChange={(event) => { setSelectedAccount(null); setEmailSearch(event.target.value) }} placeholder="medecin@exemple.com" required /><p className="text-xs text-muted-foreground">Saisissez au moins 3 caractères pour rechercher un compte patient ou médecin.</p>{!selectedAccount && emailSearch.trim().length >= 3 && <div className="max-h-40 overflow-y-auto rounded-lg border">{accountQuery.isFetching ? <p className="p-3 text-sm text-muted-foreground">Recherche en cours…</p> : accountQuery.data?.users.length ? accountQuery.data.users.map((account) => <button key={account.id} type="button" className="block w-full border-b p-3 text-left last:border-b-0 hover:bg-muted" onClick={() => { setSelectedAccount(account); setEmailSearch(account.email) }}><span className="block text-sm font-medium">{account.name}</span><span className="block text-xs text-muted-foreground">{account.email}</span></button>) : <p className="p-3 text-sm text-muted-foreground">Aucun compte disponible pour cet e-mail.</p>}</div>}{selectedAccount && <p className="text-xs text-emerald-700 dark:text-emerald-300">Compte sélectionné : {selectedAccount.name} ({selectedAccount.email})</p>}</div>}<div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="doctor-specialty">Spécialité</Label><Input id="doctor-specialty" minLength={2} maxLength={100} value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="Cardiologie" required /></div><div className="space-y-2"><Label htmlFor="doctor-department">Service / département</Label><Input id="doctor-department" minLength={2} maxLength={100} value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Consultation externe" required /></div><div className="space-y-2"><Label htmlFor="doctor-professional-id">Identifiant professionnel <span className="text-muted-foreground">(facultatif)</span></Label><Input id="doctor-professional-id" maxLength={100} value={professionalId} onChange={(event) => setProfessionalId(event.target.value)} placeholder="RPPS / numéro d’ordre" /></div><div className="space-y-2"><Label htmlFor="doctor-phone">Téléphone professionnel <span className="text-muted-foreground">(facultatif)</span></Label><Input id="doctor-phone" type="tel" minLength={8} maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+24106123456" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="doctor-status">Statut</Label><select id="doctor-status" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="active">Actif</option><option value="inactive">Inactif</option><option value="suspended">Suspendu</option></select></div></div><DialogFooter><Button type="button" variant="outline" onClick={resetForm}>Annuler</Button><Button type="submit" disabled={(!selectedAccount && !editingDoctor) || createDoctor.isPending || updateDoctor.isPending}>{(createDoctor.isPending || updateDoctor.isPending) && <Loader2 className="mr-2 size-4 animate-spin" />}{editingDoctor ? "Enregistrer" : "Créer le médecin"}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>
}
