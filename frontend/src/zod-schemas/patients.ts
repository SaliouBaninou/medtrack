import { z } from "zod"

export const patientSchema = z.object({
  dateOfBirth: z.string().min(1, "La date de naissance est obligatoire"),
  placeOfBirth: z.string().trim().min(2, "Le lieu de naissance est obligatoire").max(255),
  residence: z.string().trim().min(5, "La résidence doit contenir au moins 5 caractères").max(255),
  phone: z.string().trim().min(8, "Le téléphone doit contenir au moins 8 caractères").max(20),
  situation: z.enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"]),
  profession: z.string().trim().min(2, "La profession doit contenir au moins 2 caractères").max(100),
  gender: z.enum(["Masculin", "Féminin"]),
})

export type PatientInput = z.infer<typeof patientSchema>

export interface Patient extends PatientInput {
  id: string
  userId: string
  user?: { id: string; name: string; email: string }
  createdAt?: string
  created_at?: string
  etablissementId?: string | null
  banned?: boolean | null
  banReason?: string | null
}

export interface PatientsResponse {
  success: boolean
  patients: Patient[]
  pagination: { currentPage: number; perPage: number; totalItems: number; totalPages: number }
}
