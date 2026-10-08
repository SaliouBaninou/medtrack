import { motion } from "motion/react"
import { HeartPulse, ShieldCheck } from "lucide-react"

export function AdminLoadingScreen({ administrator = false }: { administrator?: boolean }) {
  return (
    <main className="grid min-h-svh place-items-center bg-[#f5faf8] px-5" role="status" aria-live="polite" aria-busy="true">
      <div className="w-full max-w-sm rounded-3xl border border-teal-100 bg-white p-8 text-center shadow-xl shadow-teal-950/5 sm:p-10">
        <div className="relative mx-auto flex size-16 items-center justify-center">
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.24, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl bg-teal-500"
          />
          <span className="relative flex size-12 items-center justify-center rounded-2xl bg-teal-800 text-white shadow-md shadow-teal-900/15">
            <HeartPulse className="size-6" />
          </span>
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">MedTrack · Espace sécurisé</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
          {administrator ? "Préparation de votre espace admin" : "Vérification de votre session"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {administrator
            ? "Nous chargeons vos outils et votre tableau de bord."
            : "Nous vérifions votre accès avant d’ouvrir votre espace."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <ShieldCheck className="size-4 text-teal-700" /> Connexion sécurisée
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-teal-50">
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-100%", "180%"] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-2/5 rounded-full bg-teal-700"
          />
        </div>
      </div>
    </main>
  )
}
