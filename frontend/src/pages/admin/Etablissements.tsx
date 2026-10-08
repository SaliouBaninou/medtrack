import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryState, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Building2,
  CheckCircle2,
  Activity,
  X,
  Copy,
  Check,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import {
  useEtablissements,
  useCreateEtablissement,
  useUpdateEtablissement,
  useDeleteEtablissement,
} from "@/hooks/use-etablissements"
import {
  createEtablissementSchema,
  type CreateEtablissementInput,
  type Etablissement,
} from "@/zod-schemas/etablissements"

// =========================================================
// Helpers Utilitaires & Formatage de Date Fiable
// =========================================================

function getItemCreatedDate(item: Etablissement): string | undefined {
  return (
    item.createdAt ||
    item.created_at ||
    ((item as unknown as Record<string, string>)["createdAt"]) ||
    ((item as unknown as Record<string, string>)["created_at"])
  )
}

function formatDate(dateValue?: string | Date | null): string {
  if (!dateValue) return "Date non renseignée"
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return "Date non renseignée"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatShortDate(dateValue?: string | Date | null): string {
  if (!dateValue) return "—"
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getInitials(name: string): string {
  if (!name) return "ET"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

// Couleurs d'avatars pastel pour un look Meetsponsors moderne
const AVATAR_BG_COLORS = [
  "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/40",
  "bg-lime-50 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300 border-lime-200/60 dark:border-lime-800/40",
  "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
  "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_BG_COLORS.length
  return AVATAR_BG_COLORS[index]
}

// =========================================================
// Squelettes de Chargement Modernes
// =========================================================
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell className="py-3.5 pl-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>
          <TableCell className="py-3.5">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>
          <TableCell className="py-3.5">
            <Skeleton className="h-4 w-52" />
          </TableCell>
          <TableCell className="py-3.5">
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
          <TableCell className="py-3.5 pr-6 text-right">
            <div className="flex justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// =========================================================
// Formulaire Création & Édition avec Aperçu Logo en direct
// =========================================================
interface EtablissementFormProps {
  mode: "create" | "edit"
  defaultValues?: Partial<CreateEtablissementInput>
  isSubmitting: boolean
  onSubmit: (data: CreateEtablissementInput) => void
  onCancel: () => void
  serverError?: string | null
}

function EtablissementForm({
  mode,
  defaultValues,
  isSubmitting,
  onSubmit,
  onCancel,
  serverError,
}: EtablissementFormProps) {
  const isEdit = mode === "edit"

  const form = useForm<CreateEtablissementInput>({
    resolver: zodResolver(createEtablissementSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      logo: defaultValues?.logo ?? "",
    },
  })

  // Watch logo pour preview en temps réel
  const logoValue = form.watch("logo")
  const nameValue = form.watch("name")

  React.useEffect(() => {
    form.reset({
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      logo: defaultValues?.logo ?? "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.name, defaultValues?.email])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
      {serverError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive font-medium animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Aperçu interactif du badge/avatar en haut du formulaire */}
      <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/30 p-3">
        <Avatar className="h-12 w-12 rounded-xl border shadow-xs">
          <AvatarImage src={logoValue || undefined} alt={nameValue || "Aperçu"} />
          <AvatarFallback className={`rounded-xl font-bold ${getAvatarColor(nameValue || "Med")}`}>
            {getInitials(nameValue || "ME")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">
            {nameValue.trim() ? nameValue : "Nom de l'établissement"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Aperçu visuel de l'en-tête
          </p>
        </div>
      </div>

      {/* Nom */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-name`} className="text-xs font-semibold text-foreground/90">
              Nom officiel de l'établissement <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${mode}-name`}
              placeholder="Ex : Centre Hospitalier Universitaire de Fann"
              className="h-9.5 text-sm"
              {...field}
            />
            {fieldState.error && (
              <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {/* Email + Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label htmlFor={`${mode}-email`} className="text-xs font-semibold text-foreground/90">
                Adresse e-mail <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${mode}-email`}
                type="email"
                placeholder="contact@chu-fann.sn"
                className="h-9.5 text-sm"
                {...field}
              />
              {fieldState.error && (
                <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label htmlFor={`${mode}-phone`} className="text-xs font-semibold text-foreground/90">
                Téléphone professionnel <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${mode}-phone`}
                placeholder="+221 33 869 18 18"
                className="h-9.5 text-sm"
                {...field}
              />
              {fieldState.error && (
                <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Adresse */}
      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <Label htmlFor={`${mode}-address`} className="text-xs font-semibold text-foreground/90">
              Adresse physique complète <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${mode}-address`}
              placeholder="Ex : Avenue Cheikh Anta Diop, Fann, Dakar"
              className="h-9.5 text-sm"
              {...field}
            />
            {fieldState.error && (
              <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {/* Logo */}
      <Controller
        name="logo"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${mode}-logo`} className="text-xs font-semibold text-foreground/90">
                URL du logo officiel
              </Label>
              <span className="text-[11px] text-muted-foreground">Optionnel</span>
            </div>
            <Input
              id={`${mode}-logo`}
              type="url"
              placeholder="https://images.unsplash.com/... ou URL du logo"
              className="h-9.5 text-sm"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {fieldState.error && (
              <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <DialogFooter className="pt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg h-9"
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-lg h-9 shadow-xs">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Enregistrer les modifications" : "Créer l'établissement"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// =========================================================
// Composant Principal de la Page Etablissements
// =========================================================
export default function Etablissements() {
  // ---- État d'URL synchronisé via nuqs ----
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true })
  )
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  )
  const [pageSize, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ shallow: true })
  )
  const [logoFilter, setLogoFilter] = useQueryState(
    "logo",
    parseAsStringEnum<"all" | "with-logo" | "no-logo">(["all", "with-logo", "no-logo"])
      .withDefault("all")
      .withOptions({ shallow: true })
  )
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsStringEnum<"name-asc" | "name-desc" | "newest">(["name-asc", "name-desc", "newest"])
      .withDefault("name-asc")
      .withOptions({ shallow: true })
  )

  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [searchInput, setSearchInput] = React.useState(search)

  // Synchronisation locale si le paramètre search dans l'URL change
  React.useEffect(() => {
    setSearchInput(search)
  }, [search])

  // Debounce de la saisie utilisateur vers l'URL via nuqs (350ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput.trim() ? searchInput.trim() : null)
        setCurrentPage(1)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, search, setSearch, setCurrentPage])

  // ---- Données via React Query ----
  const { data, isLoading, isError, error, refetch, isFetching } = useEtablissements({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
  })

  const rawEtablissements = data?.etablissements ?? []
  const pagination = data?.pagination

  // Filtrage local supplémentaire pour le logo & tri
  const displayedEtablissements = React.useMemo(() => {
    let list = [...rawEtablissements]

    if (logoFilter === "with-logo") {
      list = list.filter((item) => !!item.logo && item.logo.trim() !== "")
    } else if (logoFilter === "no-logo") {
      list = list.filter((item) => !item.logo || item.logo.trim() === "")
    }

    if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name-desc") {
      list.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortBy === "newest") {
      list.sort((a, b) => {
        const dateA = new Date(getItemCreatedDate(a) || 0).getTime()
        const dateB = new Date(getItemCreatedDate(b) || 0).getTime()
        return dateB - dateA
      })
    }

    return list
  }, [rawEtablissements, logoFilter, sortBy])

  // Statistiques calculées pour le bandeau KPI
  const stats = React.useMemo(() => {
    const total = pagination?.totalItems ?? rawEtablissements.length
    const withLogoCount = rawEtablissements.filter((e) => !!e.logo).length
    return {
      total,
      withLogo: withLogoCount,
      verifiedContacts: rawEtablissements.filter((e) => !!e.email && !!e.phone).length,
    }
  }, [pagination, rawEtablissements])

  // ---- Mutations ----
  const createMutation = useCreateEtablissement()
  const deleteMutation = useDeleteEtablissement()

  // ---- Modales ----
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const [selectedItem, setSelectedItem] = React.useState<Etablissement | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const updateMutation = useUpdateEtablissement(selectedItem?.id ?? "")

  // Handlers
  const handleOpenDetail = (item: Etablissement) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (item: Etablissement) => {
    setSelectedItem(item)
    setServerError(null)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (item: Etablissement) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success("Identifiant copié dans le presse-papier")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateSubmit = async (formData: CreateEtablissementInput) => {
    setServerError(null)
    try {
      await createMutation.mutateAsync(formData)
      toast.success("Établissement ajouté", {
        description: `"${formData.name}" a été enregistré avec succès.`,
      })
      setIsCreateOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      setServerError(message)
      toast.error("Échec de la création", { description: message })
    }
  }

  const handleEditSubmit = async (formData: CreateEtablissementInput) => {
    if (!selectedItem) return
    setServerError(null)
    try {
      await updateMutation.mutateAsync(formData)
      toast.success("Établissement actualisé", {
        description: `"${selectedItem.name}" a été modifié avec succès.`,
      })
      setIsEditOpen(false)
      setSelectedItem(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      setServerError(message)
      toast.error("Échec de la modification", { description: message })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return
    try {
      await deleteMutation.mutateAsync(selectedItem.id)
      toast.success("Établissement supprimé", {
        description: `"${selectedItem.name}" a été retiré définitivement.`,
      })
      setIsDeleteOpen(false)
      setSelectedItem(null)
      if (rawEtablissements.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      toast.error("Échec de la suppression", { description: message })
    }
  }

  // Calcul pagination
  const totalPages = pagination?.totalPages ?? 1
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, pagination?.totalItems ?? displayedEtablissements.length)
  const totalItemsCount = pagination?.totalItems ?? displayedEtablissements.length

  return (
    <div className="w-full px-4 md:px-8 lg:px-10 py-6 space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* SECTION FIXE : Header & KPI Statistiques                  */}
      {/* ========================================================= */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md -mx-4 md:-mx-8 lg:-mx-10 px-4 md:px-8 lg:px-10 pt-2 pb-5 space-y-4.5 border-b border-border/40 shadow-xs">
        {/* Header Titre + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Établissements de santé
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Annuaire centralisé des hôpitaux, cliniques partenaires et centres médicaux. Recherchez, gérez et éditez les structures en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9.5 px-3.5 rounded-xl border-border/60 hover:bg-muted/60 transition-all text-xs font-medium"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              <span className="hidden sm:inline ml-1.5">Actualiser</span>
            </Button>

            <Button
              onClick={() => {
                setServerError(null)
                setIsCreateOpen(true)
              }}
              className="h-9.5 px-4 rounded-xl shadow-xs gap-1.5 text-xs font-medium transition-all hover:shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel établissement</span>
            </Button>
          </div>
        </div>

        {/* 4 Cartes KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="rounded-xl border-border/50 bg-card/70 shadow-2xs backdrop-blur-xs hover:border-border transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-9.5 w-9.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-900/40">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground truncate">Total structures</p>
                <p className="text-lg font-bold tracking-tight text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/70 shadow-2xs backdrop-blur-xs hover:border-border transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-9.5 w-9.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-900/40">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground truncate">Avec logo officiel</p>
                <p className="text-lg font-bold tracking-tight text-foreground">{stats.withLogo}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/70 shadow-2xs backdrop-blur-xs hover:border-border transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-9.5 w-9.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-900/40">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground truncate">Contacts vérifiés</p>
                <p className="text-lg font-bold tracking-tight text-foreground">{stats.verifiedContacts}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/50 bg-card/70 shadow-2xs backdrop-blur-xs hover:border-border transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-9.5 w-9.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-900/40">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground truncate">État du service</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  Opérationnel
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. Barre de Contrôle : Recherche, Filtres & Tri            */}
      {/* ========================================================= */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs overflow-hidden">
        <div className="p-3.5 md:p-4 border-b border-border/50 bg-muted/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Champ de recherche moderne avec clear icon */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, adresse, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9.5 pr-8 h-10 rounded-xl bg-background border-border/70 text-sm focus-visible:ring-1 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("")
                  setSearch(null)
                  setCurrentPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtres de sélection et tri */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Filtre Logo */}
            <div className="flex items-center gap-1.5 bg-background border border-border/70 rounded-xl px-2.5 py-1 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium hidden sm:inline">Logo :</span>
              <Select
                value={logoFilter}
                onValueChange={(value) => setLogoFilter(value as "all" | "with-logo" | "no-logo")}
                items={[{ label: "Tous", value: "all" }, { label: "Avec logo", value: "with-logo" }, { label: "Sans logo", value: "no-logo" }]}
              >
                <SelectTrigger aria-label="Filtrer par logo" size="sm" className="h-7 border-0 bg-transparent px-1 text-xs font-semibold shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="with-logo">Avec logo</SelectItem>
                    <SelectItem value="no-logo">Sans logo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-1.5 bg-background border border-border/70 rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium hidden sm:inline">Tri :</span>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as "name-asc" | "name-desc" | "newest")}
                items={[{ label: "Nom (A → Z)", value: "name-asc" }, { label: "Nom (Z → A)", value: "name-desc" }, { label: "Plus récents", value: "newest" }]}
              >
                <SelectTrigger aria-label="Trier les établissements" size="sm" className="h-7 border-0 bg-transparent px-1 text-xs font-semibold shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="name-asc">Nom (A → Z)</SelectItem>
                    <SelectItem value="name-desc">Nom (Z → A)</SelectItem>
                    <SelectItem value="newest">Plus récents</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. Tableau des Établissements                             */}
        {/* ========================================================= */}
        <CardContent className="p-0">
          {/* État d'erreur */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">Échec du chargement des établissements</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                {error instanceof Error ? error.message : "Une erreur réseau inattendue s'est produite."}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer la connexion
              </Button>
            </div>
          )}

          {/* Tableau standard */}
          {!isError && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="py-3 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Établissement
                    </TableHead>
                    <TableHead className="py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Contact Direct
                    </TableHead>
                    <TableHead className="py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Localisation
                    </TableHead>
                    <TableHead className="py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Date d'enregistrement
                    </TableHead>
                    <TableHead className="py-3 pr-6 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : displayedEtablissements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-44 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                          <Building2 className="h-10 w-10 text-muted-foreground/40" />
                          <p className="text-sm font-semibold text-foreground">Aucun établissement trouvé</p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            {search
                              ? `Aucun résultat ne correspond à votre recherche "${search}".`
                              : "Aucun établissement n'est encore enregistré dans le système."}
                          </p>
                          {search && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSearchInput("")
                                setSearch(null)
                                setCurrentPage(1)
                              }}
                              className="text-xs rounded-lg mt-1 text-primary cursor-pointer"
                            >
                              Réinitialiser la recherche
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedEtablissements.map((item) => {
                      const createdDate = getItemCreatedDate(item)
                      return (
                        <TableRow
                          key={item.id}
                          className="group border-b border-border/40 hover:bg-muted/35 transition-colors"
                        >
                          {/* Colonne Établissement + Logo */}
                          <TableCell className="py-3.5 pl-6">
                            <div className="flex items-center gap-3.5">
                              <Avatar className="h-10 w-10 rounded-xl border shadow-2xs shrink-0">
                                <AvatarImage src={item.logo ?? undefined} alt={item.name} />
                                <AvatarFallback className={`rounded-xl text-xs font-bold ${getAvatarColor(item.name)}`}>
                                  {getInitials(item.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 max-w-[240px]">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(item)}
                                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors text-left block truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </button>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]">
                                    #{item.id.slice(0, 8)}
                                  </span>
                                  {item.logo ? (
                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                      Vérifié
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Colonne Contact */}
                          <TableCell className="py-3.5">
                            <div className="space-y-1">
                              <a
                                href={`mailto:${item.email}`}
                                className="text-xs text-foreground/90 hover:text-primary flex items-center gap-1.5 transition-colors font-medium truncate max-w-[200px]"
                                title={item.email}
                              >
                                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{item.email}</span>
                              </a>
                              <a
                                href={`tel:${item.phone}`}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                              >
                                <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                <span>{item.phone}</span>
                              </a>
                            </div>
                          </TableCell>

                          {/* Colonne Localisation */}
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[220px]" title={item.address}>
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{item.address}</span>
                            </div>
                          </TableCell>

                          {/* Colonne Date - CORRIGÉ : Plus jamais d'Invalid Date ! */}
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                              <span>{formatShortDate(createdDate)}</span>
                            </div>
                          </TableCell>

                          {/* Colonne Actions */}
                          <TableCell className="py-3.5 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              {/* Voir */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDetail(item)}
                                className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                title="Voir la fiche détaillée"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Voir</span>
                              </Button>

                              {/* Modifier */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(item)}
                                className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                title="Modifier les informations"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>

                              {/* Supprimer */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(item)}
                                className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                title="Supprimer cet établissement"
                                disabled={deleteMutation.isPending && selectedItem?.id === item.id}
                              >
                                {deleteMutation.isPending && selectedItem?.id === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination avec les mêmes contrôles que la data table /admin */}
          {!isError && totalItemsCount > 0 && (
            <div className="flex flex-col gap-4 border-t border-border/50 bg-muted/15 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                Affichage de <span className="font-semibold text-foreground">{startItem}</span> à{" "}
                <span className="font-semibold text-foreground">{endItem}</span> sur{" "}
                <span className="font-semibold text-foreground">{totalItemsCount}</span> établissement{totalItemsCount > 1 ? "s" : ""}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-2 text-sm">
                  <Label htmlFor="rows-per-page" className="whitespace-nowrap text-xs font-medium">Lignes par page</Label>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => { setPageSize(Number(value)); setCurrentPage(1) }}
                    items={[5, 10, 20, 50].map((size) => ({ label: `${size}`, value: `${size}` }))}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page"><SelectValue /></SelectTrigger>
                    <SelectContent side="top"><SelectGroup>{[5, 10, 20, 50].map((size) => <SelectItem key={size} value={`${size}`}>{size}</SelectItem>)}</SelectGroup></SelectContent>
                  </Select>
                </div>
                <div className="whitespace-nowrap text-sm font-medium">Page {currentPage} sur {totalPages}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8" aria-label="Première page" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1 || isLoading}><ChevronsLeft /></Button>
                  <Button variant="outline" size="icon" className="size-8" aria-label="Page précédente" onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage <= 1 || isLoading}><ChevronLeft /></Button>
                  <Button variant="outline" size="icon" className="size-8" aria-label="Page suivante" onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} disabled={currentPage >= totalPages || isLoading}><ChevronRight /></Button>
                  <Button variant="outline" size="icon" className="size-8" aria-label="Dernière page" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || isLoading}><ChevronsRight /></Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* MODAL 1 : Créer un établissement                          */}
      {/* ========================================================= */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setServerError(null)
        }}
      >
        <DialogContent className="sm:max-w-[520px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Nouveau partenaire
            </div>
            <DialogTitle className="text-lg font-bold">Ajouter un établissement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Renseignez les coordonnées officielles pour indexer cette structure dans l'annuaire MedTrack.
            </DialogDescription>
          </DialogHeader>

          <EtablissementForm
            mode="create"
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            serverError={serverError}
          />
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2 : Voir les détails (Fiche Complète Style Meetsponsors) */}
      {/* ========================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-2xl p-6">
          <DialogHeader className="pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="px-2.5 py-0.5 text-[11px] font-medium gap-1 rounded-md">
                <Building2 className="h-3 w-3 text-primary" />
                Fiche Établissement
              </Badge>
              {selectedItem && (
                <button
                  type="button"
                  onClick={() => handleCopyId(selectedItem.id)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono transition-colors"
                  title="Copier l'UUID complet"
                >
                  {copiedId === selectedItem.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-sans">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier ID</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <DialogTitle className="text-xl font-extrabold mt-1">Détails de l'établissement</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-5 pt-2">
              {/* Carte d'en-tête de la structure */}
              <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <Avatar className="h-16 w-16 rounded-2xl border shadow-xs shrink-0">
                  <AvatarImage src={selectedItem.logo ?? undefined} alt={selectedItem.name} />
                  <AvatarFallback className={`rounded-2xl text-lg font-extrabold ${getAvatarColor(selectedItem.name)}`}>
                    {getInitials(selectedItem.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-bold text-base text-foreground leading-tight">{selectedItem.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {selectedItem.id}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-background font-semibold">
                      Partenaire Conventionné
                    </Badge>
                    {selectedItem.logo && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-emerald-500/20">
                        Logo Vérifié
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Grille des Coordonnées & Infos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Email */}
                <div className="rounded-xl border border-border/50 p-3 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Courriel officiel
                  </span>
                  <a
                    href={`mailto:${selectedItem.email}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors block truncate text-sm"
                  >
                    {selectedItem.email}
                  </a>
                </div>

                {/* Téléphone */}
                <div className="rounded-xl border border-border/50 p-3 bg-card space-y-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    Ligne téléphonique
                  </span>
                  <a
                    href={`tel:${selectedItem.phone}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors block text-sm"
                  >
                    {selectedItem.phone}
                  </a>
                </div>

                {/* Adresse */}
                <div className="rounded-xl border border-border/50 p-3 bg-card space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Localisation physique
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {selectedItem.address}
                  </p>
                </div>

                {/* Date de création - CORRIGÉ : Toujours formaté correctement */}
                <div className="rounded-xl border border-border/50 p-3 bg-card space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Date d'enregistrement dans MedTrack
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {formatDate(getItemCreatedDate(selectedItem))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/50 flex sm:justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDetailOpen(false)
                if (selectedItem) handleOpenEdit(selectedItem)
              }}
              className="rounded-lg h-9 text-xs"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Modifier cette fiche
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDetailOpen(false)}
              className="rounded-lg h-9 text-xs"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 3 : Modifier un établissement                       */}
      {/* ========================================================= */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setSelectedItem(null)
            setServerError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
              <Pencil className="h-3.5 w-3.5" />
              Mise à jour
            </div>
            <DialogTitle className="text-lg font-bold">Modifier l'établissement</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mettez à jour les coordonnées et identifiants de la structure conventionnée.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <EtablissementForm
              mode="edit"
              defaultValues={{
                name: selectedItem.name,
                email: selectedItem.email,
                phone: selectedItem.phone,
                address: selectedItem.address,
                logo: selectedItem.logo ?? "",
              }}
              isSubmitting={updateMutation.isPending}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditOpen(false)
                setSelectedItem(null)
              }}
              serverError={serverError}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 4 : Confirmation de Suppression Sécurisée          */}
      {/* ========================================================= */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-1">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold">Supprimer cet établissement ?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Cette action est <strong className="text-destructive font-semibold">irréversible</strong>. L'établissement{" "}
              <strong className="text-foreground">"{selectedItem?.name}"</strong> ainsi que ses rattachements seront définitivement supprimés de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel disabled={deleteMutation.isPending} className="rounded-xl h-9 text-xs">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="h-9 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 shadow-none hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 focus-visible:ring-rose-300 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/70 dark:hover:text-rose-200"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Suppression en cours...
                </>
              ) : (
                "Confirmer la suppression"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
