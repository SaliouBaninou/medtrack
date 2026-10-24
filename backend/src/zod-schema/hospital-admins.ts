import { z } from "zod";

// ===============================
// Schémas réutilisables
// ===============================

export const professionNameSchema = z
  .string()
  .trim()
  .min(5, {
    message: "Le nom de la profession doit contenir au moins 5 caractères.",
  })
  .max(50, {
    message: "Le nom de la profession ne doit pas dépasser 50 caractères.",
  });

export const telephoneSchema = z
  .string()
  .trim()
  .min(8, {
    message: "Le numéro de téléphone doit contenir au moins 8 caractères.",
  })
  .max(15, {
    message: "Le numéro de téléphone ne doit pas dépasser 15 caractères.",
  })
  .regex(/^\+?\d+$/, {
    message: "Le numéro de téléphone est invalide.",
  });

export const userIdSchema = z
  .string()
  .trim()
  .min(1, {
    message: "L'identifiant utilisateur est obligatoire.",
  });

export const etablissementIdSchema = z
  .string()
  .trim()
  .min(1, {
    message: "L'identifiant de l'établissement est obligatoire.",
  });

export const adminIdSchema = z
  .string()
  .trim()
  .min(1, {
    message: "L'identifiant de l'administrateur est obligatoire.",
  });

// ===============================
// CREATE ADMIN
// ===============================

export const createAdminSchema = z.object({
  profession: professionNameSchema,
  telephone: telephoneSchema,
  userId: userIdSchema,
  etablissementId: etablissementIdSchema,
});

export const hospitalAdminFilterSchema = z.object({
  etablissementId: etablissementIdSchema,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(255).optional(),
}).strict();

export const adminUserSearchSchema = z.object({
  search: z.string().trim().min(3).max(255),
}).strict();

// ===============================
// UPDATE ADMIN
// ===============================

export const hospitalAdminIdParamsSchema = z.object({ id: adminIdSchema });

export const updateAdminSchema = z.object({
  profession: professionNameSchema.optional(),
  telephone: telephoneSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Au moins un champ doit être renseigné pour la mise à jour.",
});

// ===============================
// DELETE ADMIN
// ===============================

export const deleteAdminSchema = hospitalAdminIdParamsSchema;

// ===============================
// Types TypeScript
// ===============================

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type HospitalAdminFilterInput = z.infer<typeof hospitalAdminFilterSchema>;
export type HospitalAdminIdParams = z.infer<typeof hospitalAdminIdParamsSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type DeleteAdminInput = z.infer<typeof deleteAdminSchema>;
