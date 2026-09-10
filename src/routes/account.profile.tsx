import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requireAuth, useSession } from "@/features/auth";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/features/profile/queries";
import { AvatarField } from "@/features/profile/components/avatar-field";
import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { applyApiErrorToForm } from "@/lib/api-error-to-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";

export const Route = createFileRoute("/account/profile")({
  beforeLoad: requireAuth,
  component: ProfilePage,
});

const profileFormSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.email("E-mail inválido"),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres"),
    confirmNewPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function ProfileDataForm() {
  const { user } = useSession();
  const updateProfile = useUpdateProfileMutation();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({ ...values, avatarUrl });
      setSaved(true);
    } catch (error) {
      setFormError(applyApiErrorToForm(error, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <h2 className="text-[16px] font-bold text-foreground">Perfil do colecionador</h2>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-accent">
          Dados salvos com sucesso.
        </p>
      ) : null}

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id="profile-name"
          label="Nome de exibição"
          error={errors.name?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="profile-email"
          label="E-mail"
          error={errors.email?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>
      </div>

      <AvatarField value={avatarUrl} onChange={setAvatarUrl} disabled={isSubmitting} />

      <Button type="submit" disabled={isSubmitting} className="w-[131px]">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const changePassword = useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setSaved(true);
    } catch (error) {
      setFormError(applyApiErrorToForm(error, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <h2 className="text-[16px] font-medium text-foreground">Alterar senha</h2>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-sm text-accent">
          Senha alterada com sucesso.
        </p>
      ) : null}

      <FormField
        id="current-password"
        label="Senha atual"
        error={errors.currentPassword?.message}
        className="w-full md:w-[417px]"
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        id="new-password"
        label="Nova senha"
        error={errors.newPassword?.message}
        className="w-full md:w-[417px]"
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        id="confirm-new-password"
        label="Confirmar nova senha"
        error={errors.confirmNewPassword?.message}
        className="w-full md:w-[417px]"
      >
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmNewPassword)}
          {...register("confirmNewPassword")}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} className="w-[131px]">
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

function ProfilePage() {
  return (
    <div className="flex flex-col items-start gap-7 md:flex-row">
      <AccountSidebar active="profile" />
      <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
        <h1 className="sr-only">Dados do perfil</h1>
        <ProfileDataForm />
        <hr className="border-border" />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
