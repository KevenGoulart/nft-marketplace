import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth";
import { useWalletsQuery } from "@/features/wallets/queries";
import { WalletSlotSection } from "@/features/wallets/components/wallet-slot-section";
import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/wallets")({
  beforeLoad: requireAuth,
  component: WalletsPage,
});

function WalletsSkeleton() {
  return (
    <div role="status" aria-label="Carregando carteiras" className="flex w-full flex-col gap-6">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function WalletsPage() {
  const query = useWalletsQuery();

  return (
    <div className="flex flex-col items-start gap-7 md:flex-row">
      <AccountSidebar active="wallets" />
      <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
        <h1 className="sr-only">Carteiras</h1>
        {query.isPending ? (
          <WalletsSkeleton />
        ) : query.isError ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="text-foreground">Não foi possível carregar suas carteiras.</p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-tertiary">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
            <WalletSlotSection slot="primary" wallet={query.data.primary} />
            <hr className="border-border" />
            <WalletSlotSection slot="secondary" wallet={query.data.secondary} />
          </>
        )}
      </div>
    </div>
  );
}
