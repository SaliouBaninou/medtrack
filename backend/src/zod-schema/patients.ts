
import z from "zod";

// ===============================
// SCHÉMAS RÉUTILISABLES
// ===============================

export const dateOfBirthSchema = z.iso
  .date({
    error: "Veuillez saisir une date valide au format AAAA-MM-JJ",
  })
  .refine((date) => date <= new Date().toISOString().slice(0, 10), {
    error: "La date de naissance ne peut pas être dans le futur",
  });

export const placeOfBirthSchema = z
  .string()
  .trim()
  .min(2, {
    message: "Le lieu de naissance doit contenir au moins 2 caractères",
  })
  .max(255, {
    message: "Le lieu de naissance ne peut pas dépasser 255 caractères",
  });

export const residenceSchema = z
  .string()
  .trim()
  .min(5, {
    message: "Le lieu de résidence doit contenir au moins 5 caractères",
  })
  .max(255, {
    message: "Le lieu de résidence ne peut pas dépasser 255 caractères",
  });

export const phoneSchema = z
  .string()
  .trim()
  .min(8, {
    message: "Le numéro de téléphone doit contenir au moins 8 caractères",
  })
  .max(20, {
    message: "Le numéro de téléphone ne peut pas dépasser 20 caractères",
  });

export const situationSchema = z.enum(
  ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"],
  {
    message:
      "La situation familiale doit être l'une des valeurs suivantes : Célibataire, Marié(e), Divorcé(e), Veuf(ve)",
  },
);

export const professionSchema = z
  .string()
  .trim()
  .min(2, {
    message: "La profession doit contenir au moins 2 caractères",
  })
  .max(100, {
    message: "La profession ne peut pas dépasser 100 caractères",
  });

export const genderSchema = z.enum(["Masculin", "Féminin"], {
  message: "Le genre doit être l'une des valeurs suivantes : Masculin, Féminin",
});

// ===============================
// CREATE PATIENT
// ===============================

export const createPatientSchema = z.object({
  dateOfBirth: dateOfBirthSchema,
  placeOfBirth: placeOfBirthSchema,
  residence: residenceSchema,
  phone: phoneSchema,
  situation: situationSchema,
  profession: professionSchema,
  gender: genderSchema,
});

// ===============================
// UPDATE PATIENT
// ===============================

export const updatePatientSchema = createPatientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "Au moins un champ doit être renseigné pour la mise à jour du patient",
  });

// ===============================
// PATIENT ID
// ===============================

export const patientIdSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant du patient est requis").max(255),
});

// ===============================
// PATIENT FILTER
// ===============================

export const patientFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
}).strict();

export const unassignedPatientSearchSchema = z.object({
  search: z.string().trim().min(3).max(255),
}).strict();

// ===============================
// TYPES TYPESCRIPT
// ===============================

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientIdInput = z.infer<typeof patientIdSchema>;
export type PatientFilterInput = z.infer<typeof patientFilterSchema>;
