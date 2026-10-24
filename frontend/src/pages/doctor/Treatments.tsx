import { ClipboardList, Pill } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Treatments() {
  return <main className="space-y-6 px-4 py-6 md:px-8 lg:px-10">
    <header><p className="text-sm font-medium text-teal-700 dark:text-teal-300">Suivi médical</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Traitements</h1><p className="mt-2 text-sm text-muted-foreground">Suivi des traitements prescrits à vos patients.</p></header>
    <Card className="border-border/60"><CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><Pill className="size-7" /></span><h2 className="text-lg font-semibold">Aucun traitement à afficher</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Les traitements apparaîtront ici lorsqu’ils seront disponibles dans MedTrack.</p><ClipboardList className="mt-5 size-5 text-muted-foreground/40" /></CardContent></Card>
  </main>
}
