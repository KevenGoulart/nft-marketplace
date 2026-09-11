import { useEffect, useState } from "react";
import type { Wallet, WalletsResponse, WalletType } from "@/api/contracts/wallets";
import { NETWORK_LABELS } from "@/lib/networks";
import { WALLET_TYPE_LABELS } from "@/lib/wallet-types";
import { cn } from "@/lib/utils";
import { WalletForm } from "@/features/wallets/components/wallet-form";

const WALLET_TYPE_ORDER: WalletType[] = ["walletconnect", "metamask", "coinbase"];

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

      <div className="flex flex-col gap-4">
        <p className="text-[16px] font-bold text-foreground">Carteira e rede</p>
        <div className="flex flex-col gap-3">
          {WALLET_TYPE_ORDER.map((type) => {
            const active = selected?.walletType === type;
            return (
              <div
                key={type}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-[15px] text-foreground",
                  active ? "border-primary" : "border-border"
                )}
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-accent"
                >
                  {WALLET_TYPE_LABELS[type][0]}
                </span>
                <span className="flex-1 truncate">{WALLET_TYPE_LABELS[type]}</span>
                <span
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 rounded-full border",
                    active ? "border-primary bg-primary" : "border-border-soft"
                  )}
                />
                {active ? <span className="sr-only">Rede da carteira selecionada</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
