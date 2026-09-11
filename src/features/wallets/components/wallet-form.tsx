import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  upsertWalletRequestSchema,
  type UpsertWalletRequest,
  type WalletSlot,
} from "@/api/contracts/wallets";
import { useSession } from "@/features/auth";
import { useUpdateProfileMutation } from "@/features/profile/queries";
import { NETWORK_LABELS } from "@/lib/networks";
import { WALLET_TYPE_LABELS } from "@/lib/wallet-types";
import { applyApiErrorToForm } from "@/lib/api-error-to-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { useUpsertWalletMutation } from "../queries";

export function WalletForm({
  slot,
  defaultValues,
  onSaved,
  onCancel,
}: {
  slot: WalletSlot;
  defaultValues?: UpsertWalletRequest;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const { user } = useSession();
  const isPrimary = slot === "primary";
  const upsertWallet = useUpsertWalletMutation();
  const updateProfile = useUpdateProfileMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      upsertWalletRequestSchema.extend({
        name: isPrimary ? z.string().min(2, "Informe seu nome completo") : z.string().optional(),
        username: isPrimary
          ? z.string().min(3, "Informe um nome de usuário")
          : z.string().optional(),
        email: isPrimary ? z.email("E-mail inválido") : z.string().optional(),
        ensName: isPrimary ? z.string().min(1, "Informe um nome ENS") : z.string().optional(),
      }),
    [isPrimary]
  );
  type WalletFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      network: "ethereum",
      walletType: "metamask",
      referralCode: "",
      secondaryReference: "",
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      ensName: user?.ensName ?? "",
      ...defaultValues,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (isPrimary) {
        await updateProfile.mutateAsync({
          name: values.name,
          username: values.username,
          email: values.email,
          ensName: values.ensName,
        });
      }
      await upsertWallet.mutateAsync({
        slot,
        input: {
          address: values.address,
          network: values.network,
          label: values.label,
          walletType: values.walletType,
          referralCode: values.referralCode,
          secondaryReference: values.secondaryReference?.trim() || null,
        },
      });
      onSaved?.();
    } catch (error) {
      setFormError(applyApiErrorToForm(error, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      {isPrimary ? (
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <FormField
            id={`${slot}-name`}
            label="Nome de exibição"
            required
            error={errors.name?.message}
            className="w-full md:w-[417px]"
          >
            <Input
              id={`${slot}-name`}
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </FormField>

          <FormField
            id={`${slot}-label`}
            label="Apelido da carteira"
            required
            error={errors.label?.message}
            className="w-full md:w-[417px]"
          >
            <Input
              id={`${slot}-label`}
              placeholder="Ex.: Carteira principal"
              required
              aria-invalid={Boolean(errors.label)}
              {...register("label")}
            />
          </FormField>
        </div>
      ) : (
        <FormField
          id={`${slot}-label`}
          label="Apelido da carteira"
          required
          error={errors.label?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id={`${slot}-label`}
            placeholder="Ex.: Carteira secundária"
            required
            aria-invalid={Boolean(errors.label)}
            {...register("label")}
          />
        </FormField>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id={`${slot}-network`}
          label="Rede"
          required
          error={errors.network?.message}
          className="w-full md:w-[417px]"
        >
          <select
            id={`${slot}-network`}
            required
            aria-invalid={Boolean(errors.network)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            {...register("network")}
          >
            {Object.entries(NETWORK_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        {isPrimary ? (
          <FormField
            id={`${slot}-username`}
            label="Nome do perfil"
            required
            error={errors.username?.message}
            className="w-full md:w-[417px]"
          >
            <Input
              id={`${slot}-username`}
              autoComplete="username"
              required
              aria-invalid={Boolean(errors.username)}
              {...register("username")}
            />
          </FormField>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id={`${slot}-address`}
          label="Endereço da carteira"
          required
          error={errors.address?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id={`${slot}-address`}
            placeholder="0x..."
            required
            aria-invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </FormField>

        <FormField
          id={`${slot}-secondary-reference`}
          label="ENS ou carteira secundária (opcional)"
          error={errors.secondaryReference?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id={`${slot}-secondary-reference`}
            placeholder="ENS ou carteira secundária (opcional)"
            aria-invalid={Boolean(errors.secondaryReference)}
            {...register("secondaryReference")}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <FormField
          id={`${slot}-wallet-type`}
          label="Tipo de carteira"
          required
          error={errors.walletType?.message}
          className="w-full md:w-[417px]"
        >
          <select
            id={`${slot}-wallet-type`}
            required
            aria-invalid={Boolean(errors.walletType)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            {...register("walletType")}
          >
            {Object.entries(WALLET_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id={`${slot}-referral-code`}
          label="Código de indicação"
          required
          error={errors.referralCode?.message}
          className="w-full md:w-[417px]"
        >
          <Input
            id={`${slot}-referral-code`}
            required
            aria-invalid={Boolean(errors.referralCode)}
            {...register("referralCode")}
          />
        </FormField>
      </div>

      {isPrimary ? (
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <FormField
            id={`${slot}-email`}
            label="E-mail"
            required
            error={errors.email?.message}
            className="w-full md:w-[417px]"
          >
            <Input
              id={`${slot}-email`}
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </FormField>

          <FormField
            id={`${slot}-ens-name`}
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
                <img src="/icons/arrow-down.svg" alt="" className="size-[18px]" />
              </span>
              <Input
                id={`${slot}-ens-name`}
                autoComplete="off"
                required
                aria-invalid={Boolean(errors.ensName)}
                className="flex-1"
                {...register("ensName")}
              />
            </div>
          </FormField>
        </div>
      ) : null}

      <div className="mt-1 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar carteira"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
