import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { queryClient } from "@/app/query-client";
import { ApiRequestError } from "@/api/contracts/common";
import { useSession } from "@/features/auth";
import { nftDetailQueryOptions, useNftDetailQuery, useToggleFavoriteMutation } from "@/features/nft-detail/queries";
import { NftGallery } from "@/features/nft-detail/components/gallery";
import { QuantityStepper } from "@/features/nft-detail/components/quantity-stepper";
import { RelatedProducts } from "@/features/nft-detail/components/related-products";
import { useAddCartItemMutation } from "@/features/cart/queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEth } from "@/lib/eth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nft/$nftId")({
  loader: ({ params }) => {
    queryClient
      .ensureQueryData(nftDetailQueryOptions(params.nftId))
      .catch(() => null);
  },
  component: NftDetailPage,
});

function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-7">
        <div className="hidden flex-col gap-4 sm:flex">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="size-[100px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="aspect-square w-full sm:size-[444px]" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

function NftNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-lg font-bold text-foreground">NFT não encontrado</p>
      <p className="text-sm text-muted-foreground">
        Este NFT não existe ou foi removido do catálogo.
      </p>
      <Link to="/" className="text-primary underline underline-offset-4">
        Voltar para o início
      </Link>
    </div>
  );
}

function NftLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-lg font-bold text-foreground">
        Não foi possível carregar este NFT
      </p>
      <p className="text-sm text-muted-foreground">
        Verifique sua conexão e tente novamente.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

function NftDetailPage() {
  const { nftId } = Route.useParams();
  const navigate = Route.useNavigate();
  const query = useNftDetailQuery(nftId);
  const { isAuthenticated } = useSession();
  const toggleFavorite = useToggleFavoriteMutation(nftId);
  const addToCart = useAddCartItemMutation();
  const [quantity, setQuantity] = useState(1);

  if (query.isPending) return <NftDetailSkeleton />;
  if (query.isError) {
    if (query.error instanceof ApiRequestError && query.error.status === 404) {
      return <NftNotFound />;
    }
    return <NftLoadError onRetry={() => query.refetch()} />;
  }

  const nft = query.data;
  const soldOut = nft.editionsAvailable === 0;

  function handleFavoriteClick() {
    if (!isAuthenticated) {
      navigate({
        to: "/login",
        search: { redirect: `/nft/${nftId}` },
      });
      return;
    }
    toggleFavorite.mutate(!nft.isFavorite);
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-sm text-muted-foreground">Início / {nft.collection}</p>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
        <NftGallery images={nft.gallery} title={nft.title} />

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground sm:text-[28px]">
              {nft.title}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-bold text-accent sm:text-[22px]">
                {formatEth(nft.priceEth)}
              </span>
              {nft.previousPriceEth ? (
                <span className="text-base text-muted-foreground line-through">
                  {formatEth(nft.previousPriceEth)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold text-foreground">Sobre este NFT:</p>
            <p className="text-sm leading-6 text-secondary-foreground">
              {nft.description}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold text-foreground">Edição:</p>
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-medium",
                soldOut
                  ? "bg-destructive/15 text-destructive"
                  : "bg-secondary text-accent"
              )}
            >
              {soldOut
                ? "Esgotado"
                : `${nft.editionsAvailable}/${nft.editionsTotal} disponíveis`}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {soldOut ? (
              <p className="text-sm text-muted-foreground">
                Esta edição está esgotada no momento.
              </p>
            ) : (
              <QuantityStepper
                value={quantity}
                max={nft.editionsAvailable}
                onChange={setQuantity}
              />
            )}

            <div className="flex items-center gap-2">
              <Button
                disabled={soldOut || addToCart.isPending}
                onClick={() => addToCart.mutate({ nftId, quantity })}
              >
                {addToCart.isSuccess ? "Adicionado ✓" : "COMPRAR"}
              </Button>
              <Button
                variant="outline"
                aria-pressed={nft.isFavorite}
                disabled={toggleFavorite.isPending}
                onClick={handleFavoriteClick}
                className="gap-2"
              >
                <Heart
                  className="size-4"
                  fill={nft.isFavorite ? "currentColor" : "none"}
                  aria-hidden
                />
                {nft.isFavorite ? "Favoritado" : "Favoritar"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-[15px] text-tertiary">
            <p>ID do token: #{nft.id.replace("nft-", "").padStart(4, "0")}</p>
            <p>Coleção: {nft.collection}</p>
            <p>Atributos: {nft.attributes.map((a) => a.value).join(", ")}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-base font-bold text-foreground">Detalhes do NFT</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Rede</dt>
            <dd className="capitalize text-foreground">{nft.network}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Criador</dt>
            <dd className="text-foreground">{nft.creator.name}</dd>
          </div>
        </dl>
      </section>

      <RelatedProducts collection={nft.collection} excludeNftId={nftId} />
    </div>
  );
}
