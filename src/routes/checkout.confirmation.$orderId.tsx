import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useOrderQuery, useSettlePendingCheckout } from "@/features/checkout/queries";
import { useWalletsQuery } from "@/features/wallets/queries";
import { formatEth } from "@/lib/eth";
import { NETWORK_LABELS } from "@/lib/networks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/checkout/confirmation/$orderId")({
  component: OrderConfirmationPage,
});

function formatTokenId(nftId: string) {
  return `ID do token: #${nftId.replace("nft-", "").padStart(4, "0")}`;
}

function formatOrderDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function ConfirmationSkeleton() {
  return (
    <div role="status" aria-label="Carregando confirmação" className="mx-auto flex max-w-2xl flex-col gap-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function NotFoundState() {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <p className="text-lg font-bold text-foreground">Pedido não encontrado</p>
      <p className="text-sm text-muted-foreground">
        Este pedido não existe ou não pertence à sua conta.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}

function MetaDivider() {
  return <div className="h-8 w-px shrink-0 bg-border" aria-hidden="true" />;
}

function OrderConfirmationPage() {
  const { orderId } = Route.useParams();
  const query = useOrderQuery(orderId);
  const wallets = useWalletsQuery();
  const settlePendingCheckout = useSettlePendingCheckout();
  const order = query.data;

  useEffect(() => {
    if (order) settlePendingCheckout(order);
  }, [order, settlePendingCheckout]);

  if (query.isPending) return <ConfirmationSkeleton />;
  if (query.isError || !order) return <NotFoundState />;

  const walletLabel =
    [wallets.data?.primary, wallets.data?.secondary].find((wallet) => wallet?.id === order.walletId)
      ?.label ?? "—";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="sr-only">Confirmação de pedido</h1>
      <p className="text-sm font-bold text-foreground">
        <Link to="/" className="hover:text-accent">
          Início
        </Link>{" "}
        / Mercado / Confirmação de pedido
      </p>

      {order.status === "confirmed" ? (
        <div className="relative flex flex-col overflow-hidden bg-card">
          <Link
            to="/"
            aria-label="Fechar"
            className="absolute right-4 top-4 text-foreground hover:text-accent"
          >
            <X className="size-[18px]" aria-hidden />
          </Link>

          <div className="flex flex-col items-center gap-4 px-8 py-10">
            <img src="/icons/thank-you.svg" alt="" className="size-20" />
            <p className="text-center text-base font-bold text-tertiary">
              Seus NFTs agora estão na sua carteira
            </p>
          </div>

          <div className="h-px w-full bg-primary" aria-hidden="true" />

          <div className="flex flex-wrap items-center justify-between gap-4 px-9 py-4 text-sm text-tertiary">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-foreground">ID da transação</span>
              <span>{order.transactionRef}</span>
            </div>
            <MetaDivider />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-foreground">Data</span>
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
            <MetaDivider />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-foreground">Total</span>
              <span>{formatEth(order.quoteSnapshot.totalEth)}</span>
            </div>
            <MetaDivider />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-foreground">Carteira</span>
              <span>{walletLabel}</span>
            </div>
          </div>

          <div className="h-px w-full bg-primary" aria-hidden="true" />

          <div className="flex flex-col gap-4 px-11 py-6">
            <h2 className="text-[15px] font-bold text-foreground">Detalhes da transação</h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[16px] text-foreground">
                <span className="font-bold">NFTs</span>
                <div className="flex gap-12">
                  <span className="font-bold">Edições</span>
                  <span className="font-medium">Subtotal</span>
                </div>
              </div>
              <hr className="border-border" />
              <ul className="flex flex-col gap-3">
                {order.quoteSnapshot.items.map((item) => (
                  <li
                    key={item.itemId ?? item.nftId}
                    className="flex items-center justify-between gap-3 bg-card px-2 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        width={70}
                        height={70}
                        className="size-[70px] shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex flex-col gap-1.5">
                        <p className="font-bold text-foreground">{item.title}</p>
                        <p className="text-sm text-tertiary">{formatTokenId(item.nftId)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-12 text-right">
                      <span className="text-sm text-tertiary">(x {item.quantity})</span>
                      <span className="font-bold text-accent">{formatEth(item.lineTotalEth)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-end gap-2 text-[15px] text-foreground">
                <div className="flex w-full max-w-xs items-center justify-between">
                  <span>Taxa de rede</span>
                  <span className="text-lg">{formatEth(order.quoteSnapshot.networkFeeEth)}</span>
                </div>
                <div className="flex w-full max-w-xs items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg text-accent">
                    {formatEth(order.quoteSnapshot.totalEth)}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <p className="text-center text-sm text-tertiary">
              Transação confirmada na {NETWORK_LABELS[order.network]}. A propriedade foi
              transferida para sua carteira conectada e registrada na rede (simulada).
            </p>

            {order.explorerUrl ? (
              <a
                href={order.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mx-auto flex h-11 items-center justify-center rounded-[5px] bg-primary px-8 text-[16px] font-bold text-primary-foreground"
              >
                Ver no Etherscan
              </a>
            ) : null}
          </div>

          <div className="h-[10px] w-full bg-primary" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-8 py-8 text-center">
          {order.status === "pending" ? (
            <>
              <p role="status" className="text-lg font-bold text-foreground">
                Processando seu pagamento...
              </p>
              <p className="text-sm text-muted-foreground">
                Isso leva só alguns segundos. Não feche nem recarregue a página.
              </p>
            </>
          ) : (
            <>
              <p role="alert" className="text-lg font-bold text-destructive">
                Pagamento recusado
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {order.refusalReason ?? "Não foi possível confirmar o pagamento."}
              </p>
              <p className="text-sm text-muted-foreground">
                Seus itens continuam no carrinho — nada foi cobrado.
              </p>
              <Button asChild>
                <Link to="/cart">Voltar ao carrinho</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
