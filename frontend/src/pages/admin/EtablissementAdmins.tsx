import * as React from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, Ban, Building2, ChevronLeft, ChevronRight, Loader2, Pencil, Search, ShieldCheck, ShieldPlus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useEtablissementById } from "@/hooks/use-etablissements"
import { useAdminAccountSearch, useCreateHospitalAdmin, useDeleteHospitalAdmin, useHospitalAdmins, useSetHospitalAdminBan, useUpdateHospitalAdmin, type AdminAccountMatch, type HospitalAdmin } from "@/hooks/use-hospital-admins"

function EstablishmentAdminsSkeleton() {
  return <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-10" aria-label="Chargement de l’établissement et des administrateurs" aria-busy="true">
    <Skeleton className="h-8 w-44" />
    <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><Skeleton className="size-14 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-64 max-w-[60vw]" /><Skeleton className="h-4 w-80 max-w-[70vw]" /></div></div><Skeleton className="h-9 w-48 rounded-lg" /></div>
    <div className="grid gap-3 sm:grid-cols-2">{[0, 1].map((item) => <Card key={item} className="border-border/50"><CardContent className="flex items-center gap-3 p-4"><Skeleton className="size-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-3 w-36" /><Skeleton className="h-6 w-20" /></div></CardContent></Card>)}</div>
    <Card className="overflow-hidden rounded-xl border-border/60"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-64" /></div><Skeleton className="h-9 w-full sm:max-w-xs" /></div><div className="space-y-4 p-5">{[0, 1, 2, 3, 4].map((row) => <div key={row} className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-44" /></div><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-24" /></div>)}</div><div className="flex justify-between border-t px-4 py-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-64" /></div></Card>
  </div>
}

export default function EtablissementAdmins() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [emailSearch, setEmailSearch] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<AdminAccountMatch | null>(null)
  const [profession, setProfession] = React.useState("")
  const [telephone, setTelephone] = React.useState("")
  const [editingAdmin, setEditingAdmin] = React.useState<HospitalAdmin | null>(null)
  const [editProfession, setEditProfession] = React.useState("")
  const [editTelephone, setEditTelephone] = React.useState("")
  const [deleteTarget, setDeleteTarget] = React.useState<HospitalAdmin | null>(null)

  const establishmentQuery = useEtablissementById(id)
  const adminsQuery = useHospitalAdmins(id, page, pageSize, search)
  const accountQuery = useAdminAccountSearch(emailSearch.trim())
  const createAdmin = useCreateHospitalAdmin(id)
  const updateAdmin = useUpdateHospitalAdmin(id)
  const setAdminBan = useSetHospitalAdminBan(id)
  const deleteAdmin = useDeleteHospitalAdmin(id)
  const establishment = establishmentQuery.data
  const admins = adminsQuery.data?.admins ?? []
  const pagination = adminsQuery.data?.pagination
  const total = pagination?.totalItems ?? admins.length
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)

  const resetDialog = () => {
    setDialogOpen(false)
    setEmailSearch("")
    setSelectedUser(null)
    setProfession("")
    setTelephone("")
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUser) return
    try {
      await createAdmin.mutateAsync({ userId: selectedUser.id, etablissementId: id, profession, telephone })
      toast.success("Administrateur ajouté", { description: `${selectedUser.name} est maintenant associé à l’établissement.` })
      resetDialog()
    } catch (error) {
      toast.error("Création impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }

  const saveAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingAdmin) return
    try {
      await updateAdmin.mutateAsync({ id: editingAdmin.id, profession: editProfession, telephone: editTelephone })
      toast.success("Administrateur modifié")
      setEditingAdmin(null)
    } catch (error) {
      toast.error("Modification impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }

  const toggleBan = async (admin: HospitalAdmin) => {
    try {
      await setAdminBan.mutateAsync({ id: admin.id, banned: !admin.banned })
      toast.success(admin.banned ? "Compte réactivé" : "Compte banni", { description: admin.email })
    } catch (error) {
      toast.error("Action impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAdmin.mutateAsync(deleteTarget.id)
      toast.success("Administrateur supprimé", { description: "Son compte utilisateur est conservé." })
      setDeleteTarget(null)
      if (admins.length === 1 && page > 1) setPage((current) => current - 1)
    } catch (error) {
      toast.error("Suppression impossible", { description: error instanceof Error ? error.message : "Une erreur est survenue." })
    }
  }

  if (establishmentQuery.isLoading) return <EstablishmentAdminsSkeleton />
  if (establishmentQuery.isError || !establishment) return <div className="space-y-4 p-8"><Button variant="outline" onClick={() => navigate("/admin/etablissements")}><ArrowLeft className="mr-2 h-4 w-4" />Retour aux établissements</Button><p className="text-sm text-destructive">Impossible de charger cet établissement.</p></div>

  return <div className="w-full animate-in space-y-6 px-4 py-6 fade-in duration-300 md:px-8 lg:px-10">
    <Button variant="outline" size="sm" className="group mb-1 rounded-xl border-border/70 bg-card px-3.5 shadow-sm transition hover:-translate-x-0.5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary" render={<Link to="/admin/etablissements" />}><ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />Tous les établissements</Button>
    <section className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Building2 className="size-7" /></div><div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Établissement</p><h1 className="truncate text-2xl font-extrabold tracking-tight">{establishment.name}</h1><p className="truncate text-sm text-muted-foreground">{establishment.email} · {establishment.address}</p></div></div>
      <Button onClick={() => setDialogOpen(true)} className="shrink-0"><ShieldPlus className="mr-2 h-4 w-4" />Ajouter un administrateur</Button>
    </section>

    <div className="grid gap-3 sm:grid-cols-2"><Card className="border-border/50"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><Users className="size-5" /></span><div><p className="text-xs text-muted-foreground">Administrateurs associés</p><p className="text-2xl font-bold">{adminsQuery.isLoading ? "—" : total}</p></div></CardContent></Card><Card className="border-border/50"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Building2 className="size-5" /></span><div><p className="text-xs text-muted-foreground">Contact de l’établissement</p><p className="max-w-72 truncate text-sm font-semibold">{establishment.phone}</p></div></CardContent></Card></div>

    <Card className="overflow-hidden rounded-xl border-border/60"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Équipe d’administration</h2><p className="text-xs text-muted-foreground">Filtrez par nom, e-mail, profession ou téléphone.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher un admin…" className="pl-9" /></div></div>
      {adminsQuery.isError ? <div className="p-10 text-center"><p className="font-medium">Impossible de charger les administrateurs</p><p className="mt-1 text-sm text-muted-foreground">{adminsQuery.error instanceof Error ? adminsQuery.error.message : "Vérifiez la connexion à l’API."}</p><Button variant="outline" className="mt-4" onClick={() => void adminsQuery.refetch()}>Réessayer</Button></div> : <Table><TableHeader><TableRow><TableHead className="pl-5">Administrateur</TableHead><TableHead>Profession</TableHead><TableHead>Téléphone</TableHead><TableHead>Ajouté le</TableHead><TableHead>Statut</TableHead><TableHead className="pr-5 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{adminsQuery.isLoading ? Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell className="pl-5"><div className="space-y-2 py-1"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-44" /></div></TableCell><TableCell><Skeleton className="h-6 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-28" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-6 w-20" /></TableCell><TableCell><Skeleton className="ml-auto h-8 w-24" /></TableCell></TableRow>) : admins.length === 0 ? <TableRow><TableCell colSpan={6} className="h-36 text-center"><div className="mx-auto max-w-sm"><Users className="mx-auto mb-2 size-8 text-muted-foreground/50" /><p className="font-medium">Aucun administrateur trouvé</p><p className="mt-1 text-sm text-muted-foreground">{search ? "Essayez un autre filtre." : "Ajoutez le premier administrateur de cet établissement."}</p>{!search && <Button variant="outline" size="sm" className="mt-3" onClick={() => setDialogOpen(true)}>Ajouter un admin</Button>}</div></TableCell></TableRow> : admins.map((admin) => <TableRow key={admin.id} className="group border-b border-border/40 transition-colors hover:bg-muted/35"><TableCell className="pl-5"><div className="font-semibold">{admin.name}</div><div className="text-xs text-muted-foreground">{admin.email}</div></TableCell><TableCell><Badge variant="secondary" className="font-normal">{admin.profession}</Badge></TableCell><TableCell className="text-sm">{admin.telephone}</TableCell><TableCell className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(admin.created_at))}</TableCell><TableCell>{admin.banned ? <Badge variant="destructive">Banni</Badge> : <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Actif</Badge>}</TableCell><TableCell className="pr-4"><div className="flex items-center justify-end gap-1 opacity-90 transition-opacity group-hover:opacity-100"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Modifier" aria-label={`Modifier ${admin.name}`} onClick={() => { setEditingAdmin(admin); setEditProfession(admin.profession); setEditTelephone(admin.telephone) }}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className={admin.banned ? "h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40" : "h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40"} title={admin.banned ? "Réactiver" : "Bannir"} aria-label={admin.banned ? `Réactiver ${admin.name}` : `Bannir ${admin.name}`} disabled={setAdminBan.isPending} onClick={() => void toggleBan(admin)}>{admin.banned ? <ShieldCheck className="size-4 text-emerald-600" /> : <Ban className="size-4 text-amber-600" />}</Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300" title="Supprimer" aria-label={`Supprimer ${admin.name}`} onClick={() => setDeleteTarget(admin)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell></TableRow>)}</TableBody></Table>}
      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span className="text-muted-foreground">{total ? `Affichage ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} sur ${total} administrateurs` : "0 administrateur"}</span><div className="flex items-center justify-between gap-3 sm:justify-end"><Label htmlFor="admins-page-size" className="text-xs text-muted-foreground">Par page</Label><select id="admins-page-size" className="h-8 rounded-md border bg-background px-2 text-sm" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><span className="whitespace-nowrap">Page {page} sur {totalPages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" disabled={page <= 1 || adminsQuery.isLoading} onClick={() => setPage((current) => current - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" disabled={page >= totalPages || adminsQuery.isLoading} onClick={() => setPage((current) => current + 1)}><ChevronRight /></Button></div></div>
    </Card>

    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setDialogOpen(true) }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Ajouter un administrateur</DialogTitle><DialogDescription>Recherchez un compte existant par e-mail, puis complétez son profil pour {establishment.name}.</DialogDescription></DialogHeader><form onSubmit={(event) => void submit(event)} className="space-y-4"><div className="space-y-2"><Label htmlFor="admin-email-search">E-mail du compte</Label><Input id="admin-email-search" type="email" autoComplete="off" value={selectedUser?.email ?? emailSearch} onChange={(event) => { setSelectedUser(null); setEmailSearch(event.target.value) }} placeholder="nom@exemple.com" required /><p className="text-xs text-muted-foreground">Saisissez au moins 3 caractères pour rechercher un compte.</p>{!selectedUser && emailSearch.trim().length >= 3 && <div className="max-h-40 overflow-y-auto rounded-lg border">{accountQuery.isFetching ? <p className="p-3 text-sm text-muted-foreground">Recherche en cours…</p> : accountQuery.data?.users.length ? accountQuery.data.users.map((account) => <button key={account.id} type="button" className="block w-full border-b p-3 text-left last:border-b-0 hover:bg-muted" onClick={() => { setSelectedUser(account); setEmailSearch(account.email) }}><span className="block text-sm font-medium">{account.name}</span><span className="block text-xs text-muted-foreground">{account.email}</span></button>) : <p className="p-3 text-sm text-muted-foreground">Aucun compte disponible pour cet e-mail.</p>}</div>}{selectedUser && <p className="text-xs text-emerald-700 dark:text-emerald-300">Compte sélectionné : {selectedUser.name} ({selectedUser.email})</p>}</div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="admin-profession">Profession</Label><Input id="admin-profession" minLength={5} maxLength={50} value={profession} onChange={(event) => setProfession(event.target.value)} placeholder="Gestionnaire hospitalier" required /></div><div className="space-y-2"><Label htmlFor="admin-telephone">Téléphone</Label><Input id="admin-telephone" type="tel" minLength={8} maxLength={15} pattern="\+?\d+" value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="+24106123456" required /></div></div><DialogFooter><Button type="button" variant="outline" onClick={resetDialog}>Annuler</Button><Button type="submit" disabled={!selectedUser || createAdmin.isPending}>{createAdmin.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Créer l’administrateur</Button></DialogFooter></form></DialogContent></Dialog>

    <Dialog open={!!editingAdmin} onOpenChange={(open) => { if (!open) setEditingAdmin(null) }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Modifier l’administrateur</DialogTitle><DialogDescription>Modifiez la profession ou le téléphone de {editingAdmin?.name}.</DialogDescription></DialogHeader><form onSubmit={(event) => void saveAdmin(event)} className="space-y-4"><div className="space-y-2"><Label htmlFor="edit-admin-profession">Profession</Label><Input id="edit-admin-profession" minLength={5} maxLength={50} value={editProfession} onChange={(event) => setEditProfession(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="edit-admin-telephone">Téléphone</Label><Input id="edit-admin-telephone" type="tel" minLength={8} maxLength={15} pattern="\+?\d+" value={editTelephone} onChange={(event) => setEditTelephone(event.target.value)} required /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setEditingAdmin(null)}>Annuler</Button><Button type="submit" disabled={updateAdmin.isPending}>{updateAdmin.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Enregistrer</Button></DialogFooter></form></DialogContent></Dialog>

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer cet administrateur ?</AlertDialogTitle><AlertDialogDescription>Le profil de {deleteTarget?.name} sera supprimé et son rôle antérieur restauré. Son compte utilisateur restera disponible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction disabled={deleteAdmin.isPending} onClick={(event) => { event.preventDefault(); void confirmDelete() }}>{deleteAdmin.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>
}
