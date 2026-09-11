import { useEffect, useState } from "react";
import type { Wallet, WalletsResponse } from "@/api/contracts/wallets";
import { NETWORK_LABELS } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { WalletForm } from "@/features/wallets/components/wallet-form";

function truncateAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletConnectSelect({
  wallets,
  onConnectedChange,
}: {
  wallets: WalletsResponse;
  onConnectedChange: (wallet: Wallet | null) => void;
}) {
  const available = [wallets.primary, wallets.secondary].filter(
    (wallet): wallet is Wallet => wallet !== null
  );

  const [selectedId, setSelectedId] = useState<string | null>(available[0]?.id ?? null);
  const [addingWallet, setAddingWallet] = useState(available.length === 0);

  const availableIds = available.map((wallet) => wallet.id).join(",");
  const [prevAvailableIds, setPrevAvailableIds] = useState(availableIds);
  if (availableIds !== prevAvailableIds) {
    setPrevAvailableIds(availableIds);
    if (!selectedId && available[0]) setSelectedId(available[0].id);
  }

  const selected = available.find((wallet) => wallet.id === selectedId) ?? null;

  function selectWallet(id: string) {
    setSelectedId(id);
  }

  useEffect(() => {
    onConnectedChange(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (addingWallet) {
    return (
      <div className="flex flex-col gap-3">
        {available.length > 0 ? (
          <p className="text-[15px] text-foreground">Cadastrar outra carteira</p>
        ) : (
          <p className="text-[15px] text-foreground">
            Você ainda não tem uma carteira cadastrada. Cadastre uma para continuar.
          </p>
        )}
        <WalletForm
          slot={wallets.primary ? "secondary" : "primary"}
          onSaved={() => setAddingWallet(false)}
        />
        {available.length > 0 ? (
          <button
            type="button"
            className="cursor-pointer text-left text-sm text-accent hover:underline"
            onClick={() => setAddingWallet(false)}
          >
            Usar uma carteira já cadastrada
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Carteira cadastrada">
        {available.map((wallet) => {
          const active = wallet.id === selectedId;
          return (
            <button
              key={wallet.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => selectWallet(wallet.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left text-[15px] text-foreground md:h-[45px] md:rounded-[3px] md:bg-transparent md:px-4 md:py-0",
                active ? "border-primary" : "border-border"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-4 shrink-0 rounded-full border",
                  active ? "border-primary bg-primary" : "border-border-soft"
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col md:flex-row md:items-center md:gap-3">
                <span className="truncate font-bold md:font-normal">{wallet.label}</span>
                <span className="truncate text-sm text-tertiary md:text-[15px] md:text-foreground">
                  {truncateAddress(wallet.address)}
                </span>
              </span>
              <span className="ml-auto shrink-0 text-xs text-tertiary">
                {NETWORK_LABELS[wallet.network]}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="cursor-pointer text-left text-sm text-accent hover:underline"
          onClick={() => setAddingWallet(true)}
        >
          Cadastrar outra carteira
        </button>
      </div>
    </div>
  );
}
