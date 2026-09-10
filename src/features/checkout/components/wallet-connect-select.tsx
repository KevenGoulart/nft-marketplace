import { useState } from "react";
import type { Wallet, WalletsResponse } from "@/api/contracts/wallets";
import { NETWORK_LABELS } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WalletForm } from "@/features/wallets/components/wallet-form";

type ConnectionStatus = "idle" | "connecting" | "connected" | "refused";

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
  const [status, setStatus] = useState<ConnectionStatus>("idle");
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
    setStatus("idle");
    onConnectedChange(null);
  }

  function connect() {
    if (!selected) return;
    setStatus("connecting");
    setTimeout(() => {
      setStatus("connected");
      onConnectedChange(selected);
    }, 900);
  }

  function simulateRefusal() {
    if (!selected) return;
    setStatus("connecting");
    setTimeout(() => {
      setStatus("refused");
      onConnectedChange(null);
    }, 900);
  }

  function disconnect() {
    setStatus("idle");
    onConnectedChange(null);
  }

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
            className="text-left text-sm text-accent hover:underline"
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
                "flex h-[45px] items-center gap-3 rounded-[3px] border px-4 text-left text-[15px] text-foreground",
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
              <span className="truncate">
                {wallet.label} · {truncateAddress(wallet.address)}
              </span>
              <span className="ml-auto shrink-0 text-xs text-tertiary">
                {NETWORK_LABELS[wallet.network]}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="text-left text-sm text-accent hover:underline"
          onClick={() => setAddingWallet(true)}
        >
          Cadastrar outra carteira
        </button>
      </div>

      {selected ? (
        <div className="flex flex-col gap-2">
          {status === "idle" ? (
            <div className="flex gap-3">
              <Button type="button" onClick={connect} className="flex-1">
                Conectar
              </Button>
              <Button type="button" variant="outline" onClick={simulateRefusal}>
                Simular recusa
              </Button>
            </div>
          ) : null}
          {status === "connecting" ? (
            <p role="status" className="text-sm text-muted-foreground">
              Conectando à {selected.label}...
            </p>
          ) : null}
          {status === "connected" ? (
            <div className="flex items-center justify-between rounded-[3px] border border-primary px-4 py-2 text-[15px]">
              <span className="text-foreground">
                Conectado a <strong>{selected.label}</strong>
              </span>
              <button
                type="button"
                className="text-sm text-accent hover:underline"
                onClick={disconnect}
              >
                Desconectar
              </button>
            </div>
          ) : null}
          {status === "refused" ? (
            <div className="flex items-center justify-between rounded-[3px] border border-destructive/60 px-4 py-2 text-[15px]">
              <span role="alert" className="text-destructive">
                Conexão recusada em {selected.label}.
              </span>
              <button
                type="button"
                className="text-sm text-accent hover:underline"
                onClick={connect}
              >
                Tentar de novo
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
