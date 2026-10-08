import type { ReactNode } from "react"
import { Activity, HeartPulse, ShieldCheck } from "lucide-react"
import { Link } from "react-router"

export function AuthLayout({
  children,
  eyebrow = "Un suivi pensé pour les soins",
  title = "Chaque prise compte. Chaque patient aussi.",
  description = "Retrouvez les informations utiles au suivi des traitements et accompagnez vos patients avec une meilleure compréhension de leur quotidien.",
}: {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
}) {
  return (
    <main className="grid min-h-svh bg-[#f7faf9] lg:grid-cols-2">
      <section className="flex min-h-svh flex-col px-6 py-7 sm:px-10 lg:px-14">
        <Link to="/" className="flex w-fit items-center gap-2.5 font-semibold tracking-tight text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal-800 text-white"><HeartPulse className="size-5" /></span>
          <span>medtrack<span className="text-teal-700">.</span></span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-teal-950/5 sm:p-8">
            {children}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} MedTrack · Suivi et accompagnement des traitements</p>
      </section>
      <aside className="relative hidden min-h-svh overflow-hidden bg-teal-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-32 size-[34rem] rounded-full border border-teal-400/15" />
        <div className="absolute -right-12 -top-8 size-[25rem] rounded-full border border-teal-400/15" />
        <div className="absolute -bottom-48 -left-36 size-[34rem] rounded-full bg-teal-700/30 blur-3xl" />
        <div className="relative flex items-center gap-2 text-sm font-medium text-teal-100"><ShieldCheck className="size-4" /> {eyebrow}</div>
        <div className="relative max-w-lg">
          <span className="mb-7 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-teal-200"><Activity className="size-7" /></span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Bienvenue sur MedTrack</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">{title}</h1>
          <p className="mt-5 text-base leading-7 text-teal-100/70">{description}</p>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-teal-100/60"><span className="size-1.5 rounded-full bg-emerald-300" /> Votre espace professionnel MedTrack</div>
      </aside>
    </main>
  )
}
