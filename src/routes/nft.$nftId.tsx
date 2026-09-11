import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Briefcase, Heart, Mail, MessageCircle } from "lucide-react";
import { queryClient } from "@/app/query-client";
import { ApiRequestError } from "@/api/contracts/common";
import type { NftDetail } from "@/api/contracts/nft";
import { useSession } from "@/features/auth";
import { nftDetailQueryOptions, useNftDetailQuery, useToggleFavoriteMutation } from "@/features/nft-detail/queries";
import { NftGallery } from "@/features/nft-detail/components/gallery";
import { MobileNftDetail } from "@/features/nft-detail/components/mobile-detail";
import { QuantityStepper } from "@/features/nft-detail/components/quantity-stepper";
import { RelatedProducts } from "@/features/nft-detail/components/related-products";
import { StarRating } from "@/features/nft-detail/components/star-rating";
import { useAddCartItemMutation } from "@/features/cart/queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEth } from "@/lib/eth";
import { NETWORK_LABELS } from "@/lib/networks";
import { cn } from "@/lib/utils";

function fakeContractRef(nftId: string) {
  let hash = 0;
  for (const char of nftId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hex = hash.toString(16).padStart(8, "0").toUpperCase();
  return `0x${hex.slice(0, 4)}...${hex.slice(-4)}`;
}

function buildLongDescription(nft: NftDetail) {
  return [
    `${nft.title} é uma obra digital 1/${nft.editionsTotal} da coleção ${nft.collection}, verificada na ${NETWORK_LABELS[nft.network]}. Cada atributo fica armazenado nos metadados do token, e a peça explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
    `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. ${nft.creator.name} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
  ];
}

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

function ShareLinks({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Confira ${title} na Kurio`;

  return (
    <div className="flex items-center gap-3 text-[15px] text-foreground">
      <span>Compartilhar este NFT:</span>
      <a
        href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`}
        aria-label="Compartilhar por e-mail"
        className="hover:text-accent"
      >
        <Mail className="size-4" aria-hidden />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no X"
        className="hover:text-accent"
      >
        <MessageCircle className="size-4" aria-hidden />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Compartilhar no LinkedIn"
        className="hover:text-accent"
      >
        <Briefcase className="size-4" aria-hidden />
      </a>
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
  const router = useRouter();
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
      <p className="hidden text-sm text-foreground md:block">Início / {nft.collection}</p>

      <div className="hidden flex-col gap-8 md:flex lg:flex-row lg:gap-8">
        <NftGallery images={nft.gallery} title={nft.title} />

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <h1 className="text-2xl font-bold text-foreground sm:text-[28px]">
              {nft.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-3">
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
              <StarRating rating={nft.rating} reviewCount={nft.reviewCount} />
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
                className="rounded-sm px-8"
              >
                {addToCart.isSuccess ? "Adicionado ✓" : "COMPRAR"}
              </Button>
              <Button
                variant="outline"
                aria-pressed={nft.isFavorite}
                disabled={toggleFavorite.isPending}
                onClick={handleFavoriteClick}
                className="gap-2 rounded-sm border-border-soft text-secondary-foreground"
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

          <ShareLinks title={nft.title} />
        </div>
      </div>

      <MobileNftDetail
        nft={nft}
        soldOut={soldOut}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onBack={() => router.history.back()}
        onToggleFavorite={handleFavoriteClick}
        favoritePending={toggleFavorite.isPending}
        onAddToCart={() => addToCart.mutate({ nftId, quantity })}
        addToCartPending={addToCart.isPending}
        addToCartSuccess={addToCart.isSuccess}
      />

      <section className="flex flex-col gap-6">
        <div className="flex items-start gap-8 border-b border-border">
          <div className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-accent">Detalhes do NFT</h2>
            <div className="h-0.5 bg-accent" />
          </div>
          <span aria-disabled="true" className="text-[17px] text-foreground">
            Avaliações de colecionadores ({nft.reviewCount})
          </span>
        </div>

        <div className="flex flex-col gap-3 text-sm leading-6 text-secondary-foreground">
          {buildLongDescription(nft).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-foreground">Rede:</p>
          <p className="text-sm text-secondary-foreground">
            Cunhado na {NETWORK_LABELS[nft.network]} com procedência imutável e metadados
            armazenados no IPFS.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-foreground">Contrato:</p>
          <p className="text-sm text-secondary-foreground">
            {fakeContractRef(nft.id)} • Contrato inteligente ERC-721 verificado.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-foreground">Direitos autorais:</p>
          <p className="text-sm text-secondary-foreground">
            Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente
            pelos mercados compatíveis.
          </p>
        </div>
      </section>

      <RelatedProducts collection={nft.collection} excludeNftId={nftId} />
    </div>
  );
}
