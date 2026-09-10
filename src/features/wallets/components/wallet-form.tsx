import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  upsertWalletRequestSchema,
  type UpsertWalletRequest,
  type WalletSlot,
} from "@/api/contracts/wallets";
import { ApiRequestError } from "@/api/contracts/common";
import { NETWORK_LABELS } from "@/lib/networks";
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
  const upsert = useUpsertWalletMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpsertWalletRequest>({
    resolver: zodResolver(upsertWalletRequestSchema),
    defaultValues: defaultValues ?? { network: "ethereum" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await upsert.mutateAsync({ slot, input: values });
      onSaved?.();
    } catch (error) {
      applyApiErrorToForm(error, setError);
    }
  });

  const formError =
    upsert.error instanceof ApiRequestError ? upsert.error.body.error.message : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <FormField id={`${slot}-label`} label="Nome da carteira" error={errors.label?.message}>
        <Input
          id={`${slot}-label`}
          placeholder="Ex.: Carteira principal"
          aria-invalid={Boolean(errors.label)}
          {...register("label")}
        />
      </FormField>

      <FormField id={`${slot}-network`} label="Rede" error={errors.network?.message}>
        <select
          id={`${slot}-network`}
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

      <FormField id={`${slot}-address`} label="Endereço da carteira" error={errors.address?.message}>
        <Input
          id={`${slot}-address`}
          placeholder="0x..."
          aria-invalid={Boolean(errors.address)}
          {...register("address")}
        />
      </FormField>

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
