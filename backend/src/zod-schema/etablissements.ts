import z from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, {
    message: "Le nom de l'établissement doit contenir au moins 3 caractères",
  })
  .max(100, {
    message: "Le nom de l'établissement ne peut pas dépasser 100 caractères",
  });

const emailSchema = z
  .string()
  .trim()
  .email({ message: "L'adresse e-mail n'est pas valide" })
  .max(255, { message: "L'adresse e-mail ne peut pas dépasser 255 caractères" });

const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: "Le numéro de téléphone doit contenir au moins 10 caractères" })
  .max(20, { message: "Le numéro de téléphone ne peut pas dépasser 20 caractères" });

const addressSchema = z
  .string()
  .trim()
  .min(5, { message: "L'adresse doit contenir au moins 5 caractères" })
  .max(255, { message: "L'adresse ne peut pas dépasser 255 caractères" });

const logoSchema = z.string().trim().url({ message: "L'URL du logo n'est pas valide" }).nullable();

export const createEtablissementSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  logo: logoSchema.optional(),
});

export const updateEtablissementSchema = createEtablissementSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être renseigné pour la mise à jour",
  });

export const etablissementIdSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant est requis"),
});

export const etablissementFilterSchema = z.object({
  page: z.coerce.number().int().min(1, "La page doit être supérieure ou égale à 1").default(1),
  limit: z.coerce.number().int().min(1, "La limite doit être supérieure ou égale à 1").max(100, "La limite ne peut pas dépasser 100").default(20),
  search: z.string().trim().max(255, "La recherche ne peut pas dépasser 255 caractères").optional(),
}).strict();

export type CreateEtablissementInput = z.infer<typeof createEtablissementSchema>;
export type UpdateEtablissementInput = z.infer<typeof updateEtablissementSchema>;
export type EtablissementIdInput = z.infer<typeof etablissementIdSchema>;
export type EtablissementFilterInput = z.infer<typeof etablissementFilterSchema>;
