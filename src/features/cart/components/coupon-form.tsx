import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { AppliedCoupon } from "@/api/contracts/quote";
import { ApiRequestError } from "@/api/contracts/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatEth } from "@/lib/eth";
import { useApplyCouponMutation, useRemoveCouponMutation } from "../queries";

export function CouponForm({
  appliedCoupon,
  idPrefix = "coupon",
}: {
  appliedCoupon: AppliedCoupon | null;
  idPrefix?: string;
}) {
  const [code, setCode] = useState("");
  const apply = useApplyCouponMutation();
  const remove = useRemoveCouponMutation();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    apply.mutate(code, { onSuccess: () => setCode("") });
  }

  if (appliedCoupon) {
    return (
      <div className="flex flex-col gap-2">
        <span
          id={`${idPrefix}-label`}
          className="sr-only text-sm font-bold text-foreground md:not-sr-only"
        >
          Código promocional
        </span>
        <div
          className="flex h-10 items-center justify-between rounded-full border border-primary pl-3 pr-1 md:rounded-[3px] md:pl-2"
          aria-labelledby={`${idPrefix}-label`}
        >
          <span className="text-sm text-foreground">
            <strong className="text-accent">{appliedCoupon.code}</strong> — {appliedCoupon.label}{" "}
            (-{formatEth(appliedCoupon.discountEth)})
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover cupom"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        {remove.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível remover o cupom. Tente novamente.
          </p>
        ) : null}
      </div>
    );
  }

  const errorMessage =
    apply.error instanceof ApiRequestError ? apply.error.body.error.message : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label
        htmlFor={`${idPrefix}-code`}
        className="sr-only text-sm font-bold text-foreground md:not-sr-only"
      >
        Código promocional
      </label>
      <div className="flex h-10 gap-2 md:items-stretch md:gap-0 md:overflow-hidden md:rounded-[3px] md:border md:border-primary">
        <Input
          id={`${idPrefix}-code`}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Digite o código promocional..."
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${idPrefix}-error` : undefined}
          className="h-full min-w-0 flex-1 rounded-full border-primary px-4 text-xs text-tertiary shadow-none focus-visible:ring-0 md:rounded-none md:border-none md:px-2"
        />
        <button
          type="submit"
          disabled={apply.isPending || !code.trim()}
          className="w-[102px] shrink-0 cursor-pointer rounded-full bg-primary text-[15px] font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 md:rounded-none"
        >
          {apply.isPending ? "Aplicando..." : "Aplicar"}
        </button>
      </div>
      {errorMessage ? (
        <p id={`${idPrefix}-error`} role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
