import z from "zod";

export const createEtablissementSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Le nom de l'établissement doit contenir au moins 3 caractères",
    })
    .max(100, {
      message: "Le nom de l'établissement ne peut pas dépasser 100 caractères",
    })
    .nonempty({ message: "Le nom de l'établissement est requis" }),
  email: z
    .string()
    .email({ message: "L'adresse e-mail n'est pas valide" })
    .nonempty({ message: "L'adresse e-mail est requise" }),
  phone: z.string().min(10, {
    message: "Le numéro de téléphone doit contenir au moins 10 chiffres",
  }),
  address: z
    .string()
    .min(5, {
      message: "L'adresse doit contenir au moins 5 caractères",
    })
    .max(255, {
      message: "L'adresse ne peut pas dépasser 255 caractères",
    })
    .nonempty({ message: "L'adresse est requise" }),
  logo: z.string().optional(),
});

export type CreateEtablissementInput = z.infer<
  typeof createEtablissementSchema
>;
