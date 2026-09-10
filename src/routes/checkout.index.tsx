import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import type { Wallet } from "@/api/contracts/wallets";
import { ApiRequestError } from "@/api/contracts/common";
import { queryClient } from "@/app/query-client";
import { sessionQueryOptions, useSession } from "@/features/auth";
import { useCartQuery } from "@/features/cart/queries";
import { useWalletsQuery } from "@/features/wallets/queries";
import {
  isAvailabilityConflict,
  isQuoteOutdated,
  useCreateOrderMutation,
  useSettlePendingCheckout,
} from "@/features/checkout/queries";
import { fetchOrder } from "@/features/checkout/api";
import { clearPendingCheckout, getPendingCheckout } from "@/features/checkout/pending-order";
import {
  CollectorInfoForm,
  type CollectorInfoFormHandle,
} from "@/features/checkout/components/collector-info-form";
import { WalletConnectSelect } from "@/features/checkout/components/wallet-connect-select";
import { OrderReview } from "@/features/checkout/components/order-review";
import { CartSkeleton } from "@/features/cart/components/cart-skeleton";
import { CartEmptyState, CartErrorState } from "@/features/cart/components/cart-status";
import { RealtimeNotices } from "@/features/realtime/components/realtime-notices";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/")({
  beforeLoad: async () => {
    const session = queryClient.getQueryData(sessionQueryOptions.queryKey);
    if (!session) return;

    const pending = getPendingCheckout(session.id);
    if (!pending?.orderId) return;

    const order = await fetchOrder(pending.orderId).catch(() => null);
    if (!order) {
      clearPendingCheckout();
      return;
    }
    if (order.status === "pending") {
      throw redirect({
        to: "/checkout/confirmation/$orderId",
        params: { orderId: order.id },
      });
    }
    clearPendingCheckout();
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const cartQuery = useCartQuery();
  const walletsQuery = useWalletsQuery();
  const createOrder = useCreateOrderMutation();
  const settlePendingCheckout = useSettlePendingCheckout();

  const collectorRef = useRef<CollectorInfoFormHandle>(null);
  const [connectedWallet, setConnectedWallet] = useState<Wallet | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitError(null);

    if (!connectedWallet) {
      setSubmitError("Conecte uma carteira para continuar.");
      return;
    }
    const collector = await collectorRef.current?.submit();
    if (!collector) return;

    const fresh = await cartQuery.refetch();
    const cart = fresh.data;
    if (!cart || cart.quote.items.length === 0) {
      setSubmitError("Seu carrinho está vazio.");
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        items: cart.quote.items.map((item) => ({
          itemId: item.itemId,
          nftId: item.nftId,
          quantity: item.quantity,
        })),
        couponCode: cart.quote.appliedCoupon?.code,
        quoteVersion: cart.quote.version,
        walletId: connectedWallet.id,
        network: connectedWallet.network,
        collector,
      });
      settlePendingCheckout(order);
      navigate({
        to: "/checkout/confirmation/$orderId",
        params: { orderId: order.id },
      });
    } catch (error) {
      if (isQuoteOutdated(error)) {
        clearPendingCheckout();
        setSubmitError(
          "O preço, o cupom ou a disponibilidade mudaram. Revise o resumo abaixo e confirme novamente."
        );
        return;
      }
      if (isAvailabilityConflict(error)) {
        clearPendingCheckout();
        setSubmitError(
          error instanceof ApiRequestError
            ? error.body.error.message
            : "Um dos itens ficou indisponível. Revise o carrinho."
        );
        return;
      }
      setSubmitError(
        error instanceof ApiRequestError
          ? error.body.error.message
          : "Falha ao confirmar a compra. Tente novamente."
      );
    }
  }

  if (cartQuery.isPending) return <CartSkeleton />;
  if (cartQuery.isError) return <CartErrorState onRetry={() => cartQuery.refetch()} />;
  if (cartQuery.data.quote.items.length === 0) return <CartEmptyState />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Finalizar compra</h1>
      <p className="text-sm font-bold text-foreground">
        <Link to="/" className="hover:text-accent">
          Início
        </Link>{" "}
        / Mercado / Pagamento
      </p>

      <RealtimeNotices />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col gap-3">
          <h2 className="text-[17px] font-bold text-foreground">Perfil do colecionador</h2>
          <CollectorInfoForm
            ref={collectorRef}
            defaultValues={{ name: user?.name, email: user?.email }}
          />
        </div>

        <div className="flex w-full flex-col gap-5 lg:w-[405px]">
          <h2 className="text-[17px] font-bold text-foreground">Seus NFTs</h2>
          <OrderReview quote={cartQuery.data.quote} />

          <h2 className="text-center text-[17px] font-bold text-foreground">Carteira e rede</h2>
          {walletsQuery.data ? (
            <WalletConnectSelect
              wallets={walletsQuery.data}
              onConnectedChange={setConnectedWallet}
            />
          ) : null}

          {submitError ? (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          <Button
            type="button"
            disabled={createOrder.isPending}
            onClick={handleConfirm}
            className="h-[45px] rounded-lg text-[15px]"
          >
            {createOrder.isPending ? "Confirmando compra..." : "Confirmar compra"}
          </Button>
        </div>
      </div>
    </div>
  );
}
