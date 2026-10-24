import * as React from "react"
import { useQueryState, parseAsInteger, parseAsString } from "nuqs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Activity, Ban, ChevronLeft, ChevronRight, Eye, Loader2, Pencil, RefreshCw, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAssignPatient, useDeletePatient, usePatients, useSetPatientBan, useUnassignedPatients, useUpdatePatient, patientName } from "@/hooks/use-patients"
import { patientSchema, type Patient, type PatientInput } from "@/zod-schemas/patients"
import { authClient } from "@/lib/auth-client"

function PatientForm({ patient, busy, onSubmit, onCancel }: { patient: Patient; busy: boolean; onSubmit: (data: PatientInput) => void; onCancel: () => void }) {
  const form = useForm<PatientInput>({ resolver: zodResolver(patientSchema), defaultValues: { dateOfBirth: patient.dateOfBirth, placeOfBirth: patient.placeOfBirth, residence: patient.residence, phone: patient.phone, situation: patient.situation, profession: patient.profession, gender: patient.gender } })
  React.useEffect(() => { form.reset({ dateOfBirth: patient.dateOfBirth, placeOfBirth: patient.placeOfBirth, residence: patient.residence, phone: patient.phone, situation: patient.situation, profession: patient.profession, gender: patient.gender }) }, [patient, form])
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      {([ ["dateOfBirth", "Date de naissance"], ["placeOfBirth", "Lieu de naissance"], ["residence", "Résidence"], ["phone", "Téléphone"], ["profession", "Profession"] ] as const).map(([name, label]) => <div key={name} className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} type={name === "dateOfBirth" ? "date" : "text"} {...form.register(name)} />{form.formState.errors[name] && <p className="text-xs text-destructive">{form.formState.errors[name]?.message}</p>}</div>)}
      <div className="space-y-2"><Label>Genre</Label><Select value={form.watch("gender")} onValueChange={(value) => { if (value) form.setValue("gender", value as PatientInput["gender"], { shouldValidate: true }) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></div>
      <div className="space-y-2 sm:col-span-2"><Label>Situation familiale</Label><Select value={form.watch("situation")} onValueChange={(value) => { if (value) form.setValue("situation", value as PatientInput["situation"], { shouldValidate: true }) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <DialogFooter><Button type="button" variant="outline" onClick={onCancel}>Annuler</Button><Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button></DialogFooter>
  </form>
}

export default function Patients() {
  const { data: session } = authClient.useSession()
  const roles = String(session?.user.role ?? "").split(",").map((role) => role.trim())
  const isHospitalAdmin = roles.includes("admin") && !roles.includes("superadmin")
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""))
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [searchInput, setSearchInput] = React.useState(search)
  React.useEffect(() => setSearchInput(search), [search])
  React.useEffect(() => { const timer = setTimeout(() => { if (searchInput !== search) { void setSearch(searchInput.trim() || null); void setPage(1) } }, 350); return () => clearTimeout(timer) }, [searchInput, search, setSearch, setPage])
  const limit = 10
  const query = usePatients(page, limit, search)
  const patients = query.data?.patients ?? []
  const pagination = query.data?.pagination
  const total = pagination?.totalItems ?? patients.length
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)
  const remove = useDeletePatient()
  const ban = useSetPatientBan()
  const assign = useAssignPatient()
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [assignSearch, setAssignSearch] = React.useState("")
  const unassignedQuery = useUnassignedPatients(assignSearch.trim())
  const [dialog, setDialog] = React.useState<"edit" | "detail" | null>(null)
  const [selected, setSelected] = React.useState<Patient | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const edit = useUpdatePatient(selected?.id ?? "pending")

  const submit = async (data: PatientInput) => {
    if (!selected) return
    try { await edit.mutateAsync(data); toast.success("Profil patient modifié"); setDialog(null); setSelected(null) }
    catch (error) { toast.error("Impossible d’enregistrer les modifications", { description: error instanceof Error ? error.message : "Une erreur est survenue." }) }
  }
  const deletePatient = async () => {
    if (!selected) return
    try { await remove.mutateAsync(selected.id); toast.success("Profil patient supprimé"); setDeleteOpen(false); setSelected(null); if (patients.length === 1 && page > 1) void setPage(page - 1) }
    catch (error) { toast.error("Impossible de supprimer le profil patient", { description: error instanceof Error ? error.message : "Une erreur est survenue." }) }
  }
  const toggleBan = async (patient: Patient) => {
    try {
      await ban.mutateAsync({ id: patient.id, banned: !patient.banned })
      toast.success(patient.banned ? "Compte patient réactivé" : "Compte patient banni", { description: patient.user?.email })
    } catch (error) {
      toast.error("Action impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }
  const assignPatient = async (patientId: string, name: string) => {
    try {
      await assign.mutateAsync(patientId)
      toast.success("Patient associé à votre hôpital", { description: name })
      setAssignOpen(false)
      setAssignSearch("")
    } catch (error) {
      toast.error("Association impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }
  const date = (value?: string | null) => value && !Number.isNaN(new Date(value).getTime()) ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—"
  const createdDate = (patient: Patient) => date(patient.createdAt ?? patient.created_at)
  const detailFields = (patient: Patient) => [["Nom", patientName(patient)], ["E-mail", patient.user?.email ?? "—"], ["Téléphone", patient.phone], ["Date de naissance", date(patient.dateOfBirth)], ["Lieu de naissance", patient.placeOfBirth], ["Résidence", patient.residence], ["Genre", patient.gender], ["Situation familiale", patient.situation], ["Profession", patient.profession], ["Inscrit le", createdDate(patient)]]

  return <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-10 animate-in fade-in duration-300">
    <div className="sticky top-0 z-20 -mx-4 space-y-4 border-b border-border/40 bg-background/95 px-4 pb-5 pt-2 shadow-xs backdrop-blur-md md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Patients</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{isHospitalAdmin ? "Patients associés à votre établissement. Recherchez, consultez et gérez leurs profils." : "Annuaire des patients. Consultez leurs coordonnées et gérez leurs profils."}</p></div><div className="flex gap-2 self-start">{isHospitalAdmin && <Button size="sm" onClick={() => setAssignOpen(true)}><UserPlus className="mr-1.5 size-4" />Associer un patient</Button>}<Button variant="outline" size="sm" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={`mr-1.5 h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />Actualiser</Button></div></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Card className="border-border/50 bg-card/70"><CardContent className="flex items-center gap-3 p-3.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"><Users className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">Profils patients</p><p className="text-xl font-bold">{query.isLoading ? "—" : total}</p></div></CardContent></Card><Card className="border-border/50 bg-card/70"><CardContent className="flex items-center gap-3 p-3.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><Activity className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">Affichés sur cette page</p><p className="text-xl font-bold">{patients.length}</p></div></CardContent></Card></div>
    </div>
    <Card className="overflow-hidden rounded-xl border-border/60"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Annuaire des patients</h2><p className="text-xs text-muted-foreground">Rechercher par nom, e-mail, téléphone ou résidence</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Rechercher un patient…" className="pl-9" /></div></div>
      {query.isError ? <div className="p-12 text-center"><p className="font-medium">Impossible de charger les patients</p><p className="mt-1 text-sm text-muted-foreground">{query.error instanceof Error ? query.error.message : "Vérifiez la connexion à l’API."}</p><Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>Réessayer</Button></div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-5">Patient</TableHead><TableHead>Téléphone</TableHead><TableHead>Résidence</TableHead><TableHead>Naissance</TableHead><TableHead>Inscription</TableHead><TableHead>État du compte</TableHead><TableHead className="pr-5 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{query.isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-40" /></div></TableCell>{Array.from({ length: 4 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}<TableCell><Skeleton className="h-6 w-20" /></TableCell><TableCell><Skeleton className="ml-auto h-8 w-32" /></TableCell></TableRow>) : patients.length === 0 ? <TableRow><TableCell colSpan={7} className="h-36 text-center"><p className="font-medium">Aucun patient trouvé</p><p className="mt-1 text-sm text-muted-foreground">Essayez une autre recherche.</p></TableCell></TableRow> : patients.map((patient) => { const name = patientName(patient); return <TableRow key={patient.id}><TableCell className="pl-5"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 rounded-xl"><AvatarFallback className="rounded-xl bg-teal-50 font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</AvatarFallback></Avatar><div><p className="font-semibold">{name}</p><p className="max-w-44 truncate text-xs text-muted-foreground">{patient.user?.email ?? "E-mail indisponible"}</p></div></div></TableCell><TableCell className="text-sm">{patient.phone || "—"}</TableCell><TableCell><div className="max-w-48 truncate text-sm">{patient.residence || "—"}</div></TableCell><TableCell className="text-sm">{date(patient.dateOfBirth)}</TableCell><TableCell><Badge variant="secondary" className="font-normal">{createdDate(patient)}</Badge></TableCell><TableCell>{patient.banned ? <Badge variant="destructive">Banni</Badge> : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Actif</Badge>}</TableCell><TableCell className="pr-5"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label="Voir le patient" onClick={() => { setSelected(patient); setDialog("detail") }}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Modifier le patient" onClick={() => { setSelected(patient); setDialog("edit") }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" disabled={ban.isPending} title={patient.banned ? "Réactiver le compte" : "Bannir le compte"} aria-label={patient.banned ? "Réactiver le compte patient" : "Bannir le compte patient"} onClick={() => void toggleBan(patient)}>{patient.banned ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <Ban className="h-4 w-4 text-amber-600" />}</Button><Button variant="ghost" size="icon" aria-label="Supprimer le profil patient" onClick={() => { setSelected(patient); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell></TableRow> })}</TableBody></Table></div>}
      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{total ? `Affichage ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} sur ${total} patients` : "0 patient"}</span><div className="flex items-center justify-between gap-2 sm:justify-end"><span className="mr-2 whitespace-nowrap">Page {page} sur {totalPages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" disabled={page <= 1 || query.isLoading} onClick={() => void setPage(page - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" disabled={page >= totalPages || query.isLoading} onClick={() => void setPage(page + 1)}><ChevronRight /></Button></div></div>
    </Card>
    <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) { setDialog(null); setSelected(null) } }}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{dialog === "edit" ? "Modifier le profil patient" : "Dossier patient"}</DialogTitle><DialogDescription>{dialog === "detail" ? "Informations du profil patient." : "Les coordonnées du compte (nom et e-mail) sont gérées séparément."}</DialogDescription></DialogHeader>{dialog === "detail" && selected ? <div className="grid gap-4 py-2 sm:grid-cols-2">{detailFields(selected).map(([label, value]) => <div key={label} className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || "—"}</p></div>)}</div> : dialog === "edit" && selected ? <PatientForm key={selected.id} patient={selected} busy={edit.isPending} onSubmit={(data) => void submit(data)} onCancel={() => setDialog(null)} /> : null}</DialogContent></Dialog>
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer ce profil patient ?</AlertDialogTitle><AlertDialogDescription>Le profil de {selected ? patientName(selected) : "ce patient"} sera supprimé. Son compte utilisateur ne sera pas supprimé.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction disabled={remove.isPending} onClick={(event) => { event.preventDefault(); void deletePatient() }}>{remove.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) setAssignSearch("") }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Associer un patient</DialogTitle><DialogDescription>Recherchez un profil existant par e-mail ou nom pour le rattacher à votre établissement.</DialogDescription></DialogHeader><div className="space-y-3"><Input value={assignSearch} onChange={(event) => setAssignSearch(event.target.value)} placeholder="Saisir au moins 3 caractères…" autoFocus />{assignSearch.trim().length < 3 ? <p className="text-sm text-muted-foreground">Saisissez au moins 3 caractères pour lancer la recherche.</p> : unassignedQuery.isFetching ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : unassignedQuery.isError ? <p className="text-sm text-destructive">Impossible de rechercher les patients.</p> : unassignedQuery.data?.patients?.length ? <div className="max-h-72 space-y-2 overflow-y-auto">{unassignedQuery.data.patients.map((candidate) => <button key={candidate.id} type="button" disabled={assign.isPending} onClick={() => void assignPatient(candidate.id, candidate.name)} className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"><span className="min-w-0"><span className="block truncate font-medium">{candidate.name}</span><span className="block truncate text-sm text-muted-foreground">{candidate.email}</span></span>{assign.isPending ? <Loader2 className="ml-3 size-4 animate-spin" /> : <UserPlus className="ml-3 size-4" />}</button>)}</div> : <p className="text-sm text-muted-foreground">Aucun profil patient non associé trouvé.</p>}</div></DialogContent></Dialog>
  </div>
}
