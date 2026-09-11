import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { signupRequestSchema } from "@/api/contracts/session";
import { ApiRequestError } from "@/api/contracts/common";
import { useSignupMutation } from "@/features/auth";
import { applyApiErrorToForm } from "@/lib/api-error-to-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SocialSignIn } from "./social-sign-in";

const signupFormSchema = signupRequestSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm({
  onSuccess,
  renderHeading = false,
  variant = "modal",
}: {
  onSuccess: () => void;
  renderHeading?: boolean;
  variant?: "modal" | "screen";
}) {
  const signup = useSignupMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await signup.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      onSuccess();
    } catch (error) {
      const message = applyApiErrorToForm(error, setError);
      if (error instanceof ApiRequestError && error.status === 409) {
        setError("email", { message });
      }
      setFormError(message);
    }
  });

  return (
    <>
      {renderHeading ? <h1 className="sr-only">Criar conta</h1> : null}
      <form
        onSubmit={onSubmit}
        noValidate
        className={cn("flex w-full flex-col gap-3", variant === "modal" && "px-20")}
      >
        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="sr-only">
            Nome completo
          </label>
          <Input
            id="name"
            autoComplete="name"
            placeholder={variant === "modal" ? "Seu nome completo" : "Nome de usuário"}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "text-sm",
              variant === "modal" ? "h-10 rounded-[5px] px-4" : "h-[50px] rounded-[10px] px-4"
            )}
            {...register("name")}
          />
          {errors.name ? (
            <p id="name-error" role="alert" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="sr-only">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={variant === "modal" ? "contato@email.com" : "Digite seu e-mail"}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              "text-sm",
              variant === "modal" ? "h-10 rounded-[5px] px-4" : "h-[50px] rounded-[10px] px-4"
            )}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="sr-only">
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={variant === "modal" ? "***********" : "Senha"}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={cn(
                "pr-10 text-sm",
                variant === "modal" ? "h-10 rounded-[5px] px-4" : "h-[50px] rounded-[10px] px-4"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Ocultar caracteres digitados" : "Mostrar caracteres digitados"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-foreground/70 hover:text-accent"
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" aria-hidden />
              ) : (
                <Eye className="size-[18px]" aria-hidden />
              )}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="sr-only">
            Confirmar senha
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={variant === "modal" ? "***********" : "Confirmar senha"}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            className={cn(
              "text-sm",
              variant === "modal" ? "h-10 rounded-[5px] px-4" : "h-[50px] rounded-[10px] px-4"
            )}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p id="confirmPassword-error" role="alert" className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center bg-primary font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60",
            variant === "modal"
              ? "mt-3 h-[45px] rounded-[5px] text-base"
              : "mt-10 h-[60px] rounded-[10px] text-base"
          )}
        >
          {isSubmitting
            ? variant === "modal"
              ? "Criando conta..."
              : "Criando perfil..."
            : variant === "modal"
              ? "Criar conta"
              : "Criar perfil"}
        </button>
      </form>

      <SocialSignIn variant={variant} />
    </>
  );
}
