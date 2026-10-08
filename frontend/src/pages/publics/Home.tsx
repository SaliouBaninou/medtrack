import { Link } from "react-router"
import {
  Activity, ArrowRight, BellRing, Check, CheckCircle2, ChevronRight,
  ClipboardList, HeartPulse, Hospital, Pill, ShieldCheck, Smartphone,
  Stethoscope, TrendingUp, WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

const features = [
  { icon: BellRing, title: "Des rappels au bon moment", description: "Les patients reçoivent une notification à l’heure prévue et peuvent déclarer leur prise en quelques secondes." },
  { icon: Activity, title: "Un suivi qui donne du sens", description: "Visualisez l’évolution de l’observance et repérez rapidement les patients qui ont besoin d’un accompagnement." },
  { icon: ClipboardList, title: "Comprendre chaque oubli", description: "Oubli, effets indésirables ou médicament indisponible : les raisons de non-prise deviennent visibles." },
]

const pillars = [
  { icon: Hospital, number: "01", title: "Espace professionnel", text: "Les établissements et les équipes de santé suivent les patients, leurs traitements et les alertes depuis une interface web." },
  { icon: Smartphone, number: "02", title: "Application patient", text: "Le patient consulte ses prises, reçoit des rappels et signale simplement une prise ou une difficulté." },
  { icon: ShieldCheck, number: "03", title: "Une API centralisée", text: "L’API relie les applications et centralise les données pour permettre un suivi cohérent et sécurisé." },
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f8faf9] text-slate-900 selection:bg-teal-100 selection:text-teal-950">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="MedTrack, accueil">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-900/15"><HeartPulse className="size-5" /></span>
          <span className="text-lg font-bold tracking-tight">medtrack<span className="text-teal-700">.</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#solution" className="transition hover:text-teal-800">La solution</a>
          <a href="#plateforme" className="transition hover:text-teal-800">La plateforme</a>
          <a href="#equipe" className="transition hover:text-teal-800">L’équipe</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" className="hidden text-slate-700 sm:inline-flex" render={<Link to="/auth/sign-in" />}>Se connecter</Button>
          <Button className="h-10 rounded-full bg-teal-800 px-5 text-white shadow-sm hover:bg-teal-900" render={<Link to="/auth/sign-up" />}>Créer un compte <ArrowRight /></Button>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-12 lg:pb-28 lg:pt-20">
          <div className="pointer-events-none absolute -left-52 top-0 size-[34rem] rounded-full bg-teal-100/60 blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.4 }} className="relative z-[1]">
            <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.2rem]">
              Chaque prise compte<span className="text-teal-700">.</span>
              <span className="mt-2 block text-slate-500">Chaque patient aussi.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              MedTrack aide les professionnels de santé à suivre l’observance des traitements et à comprendre les difficultés rencontrées par leurs patients.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Suivi des prises</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Alertes utiles</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Causes documentées</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.45, delay: 0.08 }} className="relative mx-auto w-full max-w-[550px] lg:ml-auto">
            <div className="absolute -right-6 -top-8 size-40 rounded-full border border-teal-200/70" />
            <div className="absolute -bottom-8 -left-7 size-32 rounded-full bg-amber-100/70 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white bg-gradient-to-br from-[#e2f3ee] via-[#edf7f3] to-[#d8eee7] p-4 shadow-[0_32px_90px_-38px_rgba(15,83,71,0.35)] sm:p-7">
              <div className="absolute right-10 top-8 flex size-12 items-center justify-center rounded-2xl bg-white text-teal-800 shadow-lg shadow-teal-900/10"><HeartPulse className="size-6" /></div>
              <div className="mb-4 flex items-center justify-between px-1 pt-2">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800/70">Vue d’ensemble</p><p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Suivi des traitements</p></div>
                <div className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium text-slate-600">Aujourd’hui</div>
              </div>
              <div className="rounded-3xl border border-white/90 bg-white p-5 shadow-xl shadow-teal-950/5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-medium text-slate-500">Observance globale</p><p className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-slate-900">86<span className="text-2xl text-teal-700">%</span></p></div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><TrendingUp className="size-3.5" /> +8,2%</span>
                </div>
                <div className="mt-5 flex h-24 items-end gap-2" aria-label="Tendance hebdomadaire de l’observance">
                  {[42, 57, 50, 70, 63, 83, 74, 94, 78, 100, 86, 92, 68, 82, 97, 75, 88, 100, 83, 93, 74, 89, 100, 86].map((height, index) => <div key={index} className={`flex-1 rounded-t-md ${index > 18 ? "bg-teal-700" : "bg-teal-100"}`} style={{ height: `${height}%` }} />)}
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400"><span>Lun.</span><span>Mar.</span><span>Mer.</span><span>Jeu.</span><span>Ven.</span><span>Sam.</span><span>Dim.</span></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Check className="size-4" /></span>Prises confirmées</div><p className="mt-3 text-2xl font-semibold tracking-tight">248</p><p className="mt-0.5 text-[11px] text-slate-400">sur les dernières 24 h</p></div>
                <div className="rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><BellRing className="size-4" /></span>À accompagner</div><p className="mt-3 text-2xl font-semibold tracking-tight">12</p><p className="mt-0.5 text-[11px] text-slate-400">situations à examiner</p></div>
              </div>
              <div className="absolute -left-5 top-[47%] hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:flex"><span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Pill className="size-4" /></span><div><p className="text-xs font-semibold text-slate-800">Prise déclarée</p><p className="mt-0.5 text-[10px] text-slate-500">Traitement du matin · 08:02</p></div></div>
              <div className="absolute -right-4 bottom-10 hidden items-center gap-2 rounded-2xl border border-white bg-white px-3.5 py-3 shadow-xl shadow-slate-900/10 sm:flex"><WifiOff className="size-4 text-teal-700" /><span className="text-xs font-semibold text-slate-700">Prêt pour le hors ligne</span></div>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-400">Illustration de l’interface MedTrack</p>
          </motion.div>
        </section>

        <section id="solution" className="scroll-mt-12 border-y border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.35 }} className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">La solution</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Le bon suivi commence par la bonne information.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Un traitement peut être difficile à suivre pour de nombreuses raisons. MedTrack rapproche patients et soignants pour agir plus tôt et avec plus de contexte.</p>
            </motion.div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => <motion.article key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="group rounded-3xl border border-slate-200/80 bg-[#fbfcfb] p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-xl hover:shadow-teal-950/5 sm:p-7"><span className="flex size-12 items-center justify-center rounded-2xl bg-teal-100/70 text-teal-800 transition group-hover:bg-teal-800 group-hover:text-white"><Icon className="size-5" /></span><p className="mt-7 text-xs font-bold tracking-[0.16em] text-teal-700/70">0{index + 1}</p><h3 className="mt-2 text-lg font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></motion.article>)}
            </div>
          </div>
        </section>

        <section id="plateforme" className="scroll-mt-12 bg-[#f8faf9] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.35 }} className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Une plateforme, trois piliers</p><h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Du rappel patient au suivi professionnel.</h2></div>
              <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">MedTrack réunit les outils nécessaires pour programmer les traitements, déclarer les prises, signaler les difficultés et suivre les indicateurs d’observance.</p>
            </motion.div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {pillars.map(({ icon: Icon, number, title, text }, index) => <motion.article key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.42, delay: index * 0.1 }} className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-8"><span className="absolute -right-12 -top-12 size-40 rounded-full border border-white/10" /><span className="absolute -right-5 -top-5 size-24 rounded-full border border-white/10" /><div className="relative flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300"><Icon className="size-5" /></span><span className="text-xs font-semibold tracking-[0.2em] text-slate-500">{number}</span></div><h3 className="relative mt-8 text-xl font-semibold">{title}</h3><p className="relative mt-3 text-sm leading-6 text-slate-400">{text}</p></motion.article>)}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Historique des événements</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Synchronisation des données</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Indicateurs et alertes</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-teal-700" /> Architecture évolutive</span>
            </div>
          </div>
        </section>

        <motion.section id="equipe" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5 }} className="scroll-mt-12 border-t border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">À propos du projet</p><h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">La technologie au service du soin.</h2><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">MedTrack est un projet conçu pour répondre à un enjeu concret de santé : mieux comprendre l’observance pour permettre un accompagnement adapté.</p><div className="mt-7"><Button variant="outline" className="h-11 rounded-full border-slate-200 px-5" render={<Link to="/auth/sign-in" />}>Accéder à mon espace <ChevronRight /></Button></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-[#f8faf9] p-6 sm:p-7"><span className="flex size-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-800"><Stethoscope className="size-5" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Conception & développement</p><h3 className="mt-2 text-lg font-semibold">SALIOU Baninou</h3><p className="mt-1 text-sm text-slate-500">Développeur web et mobile</p></article>
              <article className="rounded-3xl border border-slate-200 bg-[#f8faf9] p-6 sm:mt-10 sm:p-7"><span className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><HeartPulse className="size-5" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Inspiration & tests</p><h3 className="mt-2 text-lg font-semibold">MOUVENGUI Jean Emmanuel</h3><p className="mt-1 text-sm text-slate-500">Biologiste et étudiant en pharmacologie</p></article>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] bg-teal-800 px-7 py-9 text-white sm:px-10 sm:py-11 lg:flex-row lg:items-center lg:px-14">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">MedTrack</p><h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">Un meilleur suivi, une meilleure continuité des soins.</h2><p className="mt-2 text-sm text-teal-100/80">Rejoignez votre espace MedTrack.</p></div>
            <Button className="h-12 shrink-0 rounded-full bg-white px-6 font-semibold text-teal-900 hover:bg-teal-50" render={<Link to="/auth/sign-up" />}>Commencer <ArrowRight /></Button>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-800"><span className="flex size-7 items-center justify-center rounded-lg bg-teal-800 text-white"><HeartPulse className="size-4" /></span>medtrack.</Link>
          <p>Projet conçu par SALIOU Baninou, avec l’inspiration et les tests de MOUVENGUI Jean Emmanuel.</p>
          <p>© {new Date().getFullYear()} MedTrack</p>
        </div>
      </footer>
    </div>
  )
}
