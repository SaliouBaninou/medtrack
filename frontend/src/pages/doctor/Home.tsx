import { Link } from "react-router"
import { ArrowRight, ClipboardList, Stethoscope, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DoctorHome() {
  return <main className="space-y-6 px-4 py-6 md:px-8 lg:px-10">
    <header><p className="text-sm font-medium text-teal-700 dark:text-teal-300">Espace professionnel</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Bienvenue dans votre espace médecin</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Retrouvez vos patients et accédez au suivi des traitements depuis un espace conçu pour votre pratique.</p></header>
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="border-border/60 transition-shadow hover:shadow-md"><CardHeader><div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300"><UsersRound className="size-5" /></div><CardTitle>Patients</CardTitle><CardDescription>Consultez les patients rattachés à votre établissement.</CardDescription></CardHeader><CardContent><Button render={<Link to="/medecin/patients" />}>Ouvrir les patients<ArrowRight className="ml-2 size-4" /></Button></CardContent></Card>
      <Card className="border-border/60 transition-shadow hover:shadow-md"><CardHeader><div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300"><ClipboardList className="size-5" /></div><CardTitle>Traitements</CardTitle><CardDescription>Accédez au suivi des traitements de vos patients.</CardDescription></CardHeader><CardContent><Button variant="outline" render={<Link to="/medecin/traitements" />}>Ouvrir les traitements<ArrowRight className="ml-2 size-4" /></Button></CardContent></Card>
    </section>
    <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-teal-950 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-100"><Stethoscope className="size-5 shrink-0" /><p>Votre espace est associé à l’établissement défini par votre administrateur.</p></div>
  </main>
}
