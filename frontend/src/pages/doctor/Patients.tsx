import * as React from "react"
import { ChevronLeft, ChevronRight, Search, UsersRound } from "lucide-react"
import { usePatients, patientName } from "@/hooks/use-patients"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DoctorPatients() {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const query = usePatients(page, 10, search)
  const patients = query.data?.patients ?? []
  const pagination = query.data?.pagination
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1)
  React.useEffect(() => setPage(1), [search])

  return <main className="space-y-6 px-4 py-6 md:px-8 lg:px-10">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium text-teal-700 dark:text-teal-300">Suivi médical</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Patients</h1><p className="mt-2 text-sm text-muted-foreground">Patients associés à votre établissement.</p></div><div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un patient…" className="pl-9" /></div></header>
    <Card className="overflow-hidden rounded-xl border-border/60"><div className="border-b p-4"><h2 className="font-semibold">Liste des patients</h2><p className="text-xs text-muted-foreground">Recherche par nom, e-mail, téléphone ou résidence.</p></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-5">Patient</TableHead><TableHead>Téléphone</TableHead><TableHead>Résidence</TableHead><TableHead>Naissance</TableHead><TableHead>Inscription</TableHead></TableRow></TableHeader><TableBody>
      {query.isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-28" /></TableCell>)}</TableRow>) : query.isError ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-destructive">Impossible de charger les patients.</TableCell></TableRow> : patients.length === 0 ? <TableRow><TableCell colSpan={5} className="h-40 text-center"><UsersRound className="mx-auto mb-2 size-8 text-muted-foreground/50" /><p className="font-medium">Aucun patient trouvé</p><p className="mt-1 text-sm text-muted-foreground">Essayez de modifier votre recherche.</p></TableCell></TableRow> : patients.map((patient) => <TableRow key={patient.id}><TableCell className="pl-5"><p className="font-semibold">{patientName(patient)}</p><p className="text-xs text-muted-foreground">{patient.user?.email ?? "E-mail indisponible"}</p></TableCell><TableCell>{patient.phone || "—"}</TableCell><TableCell>{patient.residence || "—"}</TableCell><TableCell>{patient.dateOfBirth || "—"}</TableCell><TableCell><Badge variant="secondary">{patient.created_at ? new Intl.DateTimeFormat("fr-FR").format(new Date(patient.created_at)) : "—"}</Badge></TableCell></TableRow>)}
    </TableBody></Table></div><div className="flex items-center justify-between border-t px-4 py-3 text-sm"><span className="text-muted-foreground">{pagination?.totalItems ?? 0} patient(s)</span><div className="flex items-center gap-2"><span>Page {page} sur {totalPages}</span><Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" disabled={page <= 1 || query.isLoading} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" disabled={page >= totalPages || query.isLoading} onClick={() => setPage((value) => value + 1)}><ChevronRight /></Button></div></div></Card>
  </main>
}
