import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { NavLink, useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { authClient } from "@/lib/auth-client"
import {
  signUpSchema,
  type TypeSignUpSchema,
} from "@/zod-schemas/auth"
import { cn } from "cn"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"
import { startDemoOtp } from "@/lib/demo-auth"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const navigate = useNavigate()

  const form = useForm<TypeSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(loginData: TypeSignUpSchema) {
    await authClient.signUp.email({
      email: loginData.email,
      password: loginData.password,
      name: loginData.name,
    }, {
      onSuccess: () => {
        toast.success("Inscription réussie", {
          description: "Votre compte a été créé. Vérifiez maintenant votre adresse e-mail.",
        })
        form.reset()
        startDemoOtp(loginData.email, "verification")
        navigate(`/auth/verifier-code?email=${encodeURIComponent(loginData.email)}&purpose=verification`, { replace: true })
      },
      onError: (ctx) => {
        toast.error("Inscription impossible", {
          description: ctx.error.message,
        })
      },
    })
  }


  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            Créer votre compte
          </h1>

          <p className="text-sm text-balance text-muted-foreground">
            Remplissez le formulaire ci-dessous pour créer votre compte.
          </p>
        </div>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="name">
                Nom complet
              </FieldLabel>

              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                autoComplete="name"
                {...field}
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="email">
                Adresse e-mail
              </FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                autoComplete="email"
                {...field}
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="password">
                Mot de passe
              </FieldLabel>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...field}
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmer le mot de passe
              </FieldLabel>

              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...field}
              />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? <Spinner/>
              : "Créer mon compte"}
          </Button>
        </Field>

        {/* Séparateur */}
        <FieldSeparator>
          Ou continuer avec
        </FieldSeparator>

        {/* Google */}
        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12.173 12 12.173c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>

            Continuer avec Google
          </Button>

          <FieldDescription className="px-6 text-center">
            Vous avez déjà un compte ?{" "}
            <NavLink
              to="/auth/sign-in"
              className="font-medium underline underline-offset-4"
            >
              Se connecter
            </NavLink>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
