import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown } from "lucide-react";
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

const profileFormSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    username: z.string().min(3, "Informe um nome de usuário"),
    email: z.email("E-mail inválido"),
    ensName: z.string().min(1, "Informe um nome ENS"),
    walletNickname: z.string().min(1, "Dê um apelido para sua carteira"),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = Boolean(
      data.currentPassword || data.newPassword || data.confirmNewPassword
    );
    if (!wantsPasswordChange) return;

    if (!data.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "Informe a senha atual",
      });
    }
    if (data.newPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha precisa ter ao menos 8 caracteres",
      });
    }
    if (!data.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Confirme a nova senha",
      });
    }
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "A nova senha deve ser diferente da atual",
      });
    }
    if (
      data.newPassword &&
      data.confirmNewPassword &&
      data.newPassword !== data.confirmNewPassword
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "As senhas não coincidem",
      });
    }
  });
type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileDataForm() {
  const { user } = useSession();
  const updateProfile = useUpdateProfileMutation();
  const changePassword = useChangePasswordMutation();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      ensName: user?.ensName ?? "",
      walletNickname: user?.walletNickname ?? "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        ensName: values.ensName,
        walletNickname: values.walletNickname,
        avatarUrl,
      });

      const wantsPasswordChange = Boolean(
        values.currentPassword || values.newPassword || values.confirmNewPassword
      );
      if (wantsPasswordChange) {
        await changePassword.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetField("currentPassword");
        resetField("newPassword");
        resetField("confirmNewPassword");
      }

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
          required
          error={errors.name?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-name"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </FormField>

        <FormField
          id="profile-username"
          label="Nome de usuário"
          required
          error={errors.username?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-username"
            autoComplete="username"
            required
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id="profile-email"
          label="E-mail"
          required
          error={errors.email?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </FormField>

        <FormField
          id="profile-ens-name"
          label="Nome ENS"
          required
          error={errors.ensName?.message}
          className="w-full md:w-[417px]"
        >
          <div className="flex gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-[78px] shrink-0 items-center justify-between rounded-md border border-input px-3 text-sm text-foreground"
            >
              .eth
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </span>
            <Input
              id="profile-ens-name"
              autoComplete="off"
              required
              aria-invalid={Boolean(errors.ensName)}
              className="flex-1"
              {...register("ensName")}
            />
          </div>
        </FormField>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id="profile-wallet-nickname"
          label="Apelido da carteira"
          required
          error={errors.walletNickname?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id="profile-wallet-nickname"
            autoComplete="off"
            required
            aria-invalid={Boolean(errors.walletNickname)}
            {...register("walletNickname")}
          />
        </FormField>

        <div className="w-full md:w-[417px]">
          <AvatarField value={avatarUrl} onChange={setAvatarUrl} disabled={isSubmitting} />
        </div>
      </div>

      <h2 className="text-[16px] font-medium text-foreground">Alterar senha</h2>

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

      <Button type="submit" disabled={isSubmitting} className="w-[131px] rounded-[4px]">
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
      </div>
    </div>
  );
}
