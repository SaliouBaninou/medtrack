import { z } from "zod"

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit contenir au moins 2 caractères." })
      .nonempty({ message: "Le nom est obligatoire." }),

    email: z
      .string()
      .email({ message: "Veuillez saisir une adresse e-mail valide." })
      .nonempty({ message: "L'adresse e-mail est obligatoire." }),

    password: z
      .string()
      .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
      .nonempty({ message: "Le mot de passe est obligatoire." }),

    confirmPassword: z
      .string()
      .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
      .nonempty({ message: "La confirmation du mot de passe est obligatoire." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: z
    .string()
    .email({ message: "Veuillez saisir une adresse e-mail valide." })
    .nonempty({ message: "L'adresse e-mail est obligatoire." }),

  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
    .nonempty({ message: "Le mot de passe est obligatoire." }),
})

export type TypeSignUpSchema = z.infer<typeof signUpSchema>
export type TypeSignInSchema = z.infer<typeof signInSchema>
