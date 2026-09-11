import { useState } from "react";
import type { Wallet, WalletSlot } from "@/api/contracts/wallets";
import { NETWORK_LABELS } from "@/lib/networks";
import { Button } from "@/components/ui/button";
import { WalletForm } from "./wallet-form";

const SLOT_TITLE: Record<WalletSlot, string> = {
  primary: "Carteira principal",
  secondary: "Carteira secundária",
};

export function WalletSlotSection({
  slot,
  wallet,
  primaryWallet,
}: {
  slot: WalletSlot;
  wallet: Wallet | null;
  primaryWallet?: Wallet | null;
}) {
  const [editing, setEditing] = useState(false);
  const [duplicatingPrimary, setDuplicatingPrimary] = useState(false);

  const canDuplicatePrimary = slot === "secondary" && Boolean(primaryWallet) && !wallet;

  function startEditing(duplicatePrimary: boolean) {
    setDuplicatingPrimary(duplicatePrimary);
    setEditing(true);
  }

  function stopEditing() {
    setEditing(false);
    setDuplicatingPrimary(false);
  }

  const sourceWallet = wallet ?? (duplicatingPrimary ? (primaryWallet ?? null) : null);
  const defaultValues = sourceWallet
    ? {
        address: sourceWallet.address,
        network: sourceWallet.network,
        label: sourceWallet.label,
        walletType: sourceWallet.walletType,
        referralCode: sourceWallet.referralCode,
        secondaryReference: sourceWallet.secondaryReference,
      }
    : undefined;

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-foreground">{SLOT_TITLE[slot]}</h2>
        {wallet && !editing ? (
          <button
            type="button"
            className="cursor-pointer text-[15px] font-medium text-accent hover:underline"
            onClick={() => startEditing(false)}
          >
            Editar
          </button>
        ) : null}
      </div>

      {!wallet && !editing ? (
        <>
          <p className="text-sm text-tertiary">
            {slot === "primary"
              ? "Você ainda não cadastrou uma carteira principal."
              : "Você ainda não adicionou uma carteira secundária."}
          </p>
          <div className="flex gap-3">
            {canDuplicatePrimary ? (
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={() => startEditing(true)}
              >
                Duplicar carteira principal
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => startEditing(false)}
            >
              Adicionar
            </Button>
          </div>
        </>
      ) : null}

      {wallet && !editing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-bold text-foreground">{wallet.label}</p>
            <p className="break-all text-sm text-tertiary">{wallet.address}</p>
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {NETWORK_LABELS[wallet.network]}
          </span>
        </div>
      ) : null}

      {editing ? (
        <WalletForm slot={slot} defaultValues={defaultValues} onSaved={stopEditing} onCancel={stopEditing} />
      ) : null}
    </section>
  );
}
