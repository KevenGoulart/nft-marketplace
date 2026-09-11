import { createFileRoute, Link } from "@tanstack/react-router";
import { useCartQuery } from "@/features/cart/queries";
import { CartItemsList } from "@/features/cart/components/cart-items-list";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { CartSkeleton } from "@/features/cart/components/cart-skeleton";
import { CartEmptyState, CartErrorState } from "@/features/cart/components/cart-status";
import { CollectorsAlsoViewed } from "@/features/cart/components/collectors-also-viewed";
import { RealtimeNotices } from "@/features/realtime/components/realtime-notices";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const query = useCartQuery();

  return (
    <div className="flex flex-col gap-3">
      <p aria-label="Você está em" className="hidden text-sm font-bold text-foreground md:block">
        <Link to="/" className="hover:text-accent">
          Início
        </Link>{" "}
        / Mercado / Carrinho
      </p>

      <h1 className="text-center text-lg font-bold text-foreground md:sr-only">
        Carrinho de NFTs
      </h1>

      <RealtimeNotices />

      {query.isPending ? (
        <CartSkeleton />
      ) : query.isError ? (
        <CartErrorState onRetry={() => query.refetch()} />
      ) : query.data.quote.items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="flex flex-col gap-10 pt-3">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
            <CartItemsList items={query.data.quote.items} />
            <CartSummary quote={query.data.quote} />
          </div>

          <div className="mt-14 mb-6 md:mb-24">
            <CollectorsAlsoViewed
              excludeNftIds={query.data.quote.items.map((item) => item.nftId)}
              pairOnMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
