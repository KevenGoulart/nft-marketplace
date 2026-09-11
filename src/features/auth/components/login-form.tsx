import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { loginRequestSchema, type LoginRequest } from "@/api/contracts/session";
import { useLoginMutation } from "@/features/auth";
import { applyApiErrorToForm } from "@/lib/api-error-to-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SocialSignIn } from "./social-sign-in";

export function LoginForm({
  onSuccess,
  renderHeading = false,
  variant = "modal",
}: {
  onSuccess: () => void;
  renderHeading?: boolean;
  variant?: "modal" | "screen";
}) {
  const login = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    try {
      await login.mutateAsync(data);
      onSuccess();
    } catch (error) {
      setFormError(applyApiErrorToForm(error, setError));
    }
  });

  return (
    <>
      {renderHeading ? <h1 className="sr-only">Entrar</h1> : null}
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
          <label htmlFor="email" className="sr-only">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="contato@email.com"
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
              autoComplete="current-password"
              placeholder="***********"
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

        <span aria-disabled="true" className="self-end text-sm text-accent/70">
          Esqueceu a senha?
        </span>

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
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <SocialSignIn variant={variant} />
    </>
  );
}
