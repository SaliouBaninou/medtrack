import { z } from "zod"

// ---- Champs de base réutilisables ----

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
  .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })

const emailSchema = z
  .string()
  .trim()
  .email({ message: "L'adresse e-mail n'est pas valide" })
  .max(255, { message: "L'e-mail ne peut pas dépasser 255 caractères" })

const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: "Le téléphone doit contenir au moins 10 caractères" })
  .max(20, { message: "Le téléphone ne peut pas dépasser 20 caractères" })

const addressSchema = z
  .string()
  .trim()
  .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
  .max(255, { message: "L'adresse ne peut pas dépasser 255 caractères" })

const logoSchema = z
  .string()
  .trim()
  .url({ message: "L'URL du logo n'est pas valide" })
  .or(z.literal(""))
  .optional()

// ---- Schémas exportés ----

export const createEtablissementSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  logo: logoSchema,
})

export const updateEtablissementSchema = createEtablissementSchema.partial().refine(
  (data) => Object.values(data).some((v) => v !== undefined && v !== ""),
  { message: "Au moins un champ doit être renseigné" },
)

export type CreateEtablissementInput = z.infer<typeof createEtablissementSchema>
export type UpdateEtablissementInput = z.infer<typeof updateEtablissementSchema>

// ---- Type complet Etablissement (correspondant à la réponse API) ----
export interface Etablissement {
  id: string
  name: string
  email: string
  phone: string
  address: string
  logo?: string | null
  userId?: string
  user_id?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

// ---- Types de réponses API ----

export interface GetEtablissementsResponse {
  success: boolean
  etablissements: Etablissement[]
  pagination: {
    currentPage: number
    perPage: number
    totalItems: number
    totalPages: number
  }
}

export interface SingleEtablissementResponse {
  success: boolean
  etablissement: Etablissement
}

export interface EtablissementMutationResponse {
  success: boolean
  message: string
  etablissement?: Etablissement
}

export interface DeleteEtablissementResponse {
  success: boolean
  message: string
}

