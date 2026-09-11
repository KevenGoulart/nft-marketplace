import { Heart, Search, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { NftSummary } from "@/api/contracts/nft";
import { formatEth } from "@/lib/eth";
import { useSession } from "@/features/auth";
import { useToggleFavoriteMutation } from "@/features/nft-detail/queries";
import { useAddCartItemMutation } from "@/features/cart/queries";

function isRareNft(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 5 === 0;
}

export function NftCard({ nft }: { nft: NftSummary }) {
  const soldOut = nft.editionsAvailable === 0;
  const rare = isRareNft(nft.id);
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const toggleFavorite = useToggleFavoriteMutation(nft.id);
  const addToCart = useAddCartItemMutation();

  function handleFavoriteClick() {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: `/nft/${nft.id}` } });
      return;
    }
    toggleFavorite.mutate(!nft.isFavorite);
  }

  return (
    <div className="group relative flex flex-col gap-3">
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="flex flex-col gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
      >
        <div className="relative aspect-[258/300] w-full overflow-hidden rounded-xl bg-card">
          <img
            src={nft.image}
            alt=""
            loading="lazy"
            className="absolute inset-x-[1.5%] top-[9%] aspect-square w-[97%] rounded-2xl object-cover transition-transform group-hover:scale-[1.02]"
          />
          {rare ? (
            <span className="absolute left-2 top-2 rounded-none bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              Raro
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <p className="truncate text-base text-foreground">{nft.title}</p>
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-accent">{formatEth(nft.priceEth)}</span>
            {nft.previousPriceEth ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatEth(nft.previousPriceEth)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[258/300] w-full">
        <button
          type="button"
          aria-label={
            nft.isFavorite ? `Remover ${nft.title} dos favoritos` : `Favoritar ${nft.title}`
          }
          aria-pressed={nft.isFavorite}
          disabled={toggleFavorite.isPending}
          onClick={handleFavoriteClick}
          className="pointer-events-auto absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-secondary text-foreground disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
        >
          <Heart className="size-4" fill={nft.isFavorite ? "currentColor" : "none"} aria-hidden />
        </button>

        <div className="pointer-events-auto absolute inset-x-0 bottom-3 hidden justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
          <button
            type="button"
            aria-label={`Adicionar ${nft.title} ao carrinho`}
            disabled={soldOut || addToCart.isPending}
            onClick={() => addToCart.mutate({ nftId: nft.id, quantity: 1 })}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={
              nft.isFavorite ? `Remover ${nft.title} dos favoritos` : `Favoritar ${nft.title}`
            }
            aria-pressed={nft.isFavorite}
            disabled={toggleFavorite.isPending}
            onClick={handleFavoriteClick}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              className="size-4"
              fill={nft.isFavorite ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
          <button
            type="button"
            aria-label={`Ver ${nft.title}`}
            onClick={() => navigate({ to: "/nft/$nftId", params: { nftId: nft.id } })}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground hover:text-accent"
          >
            <Search className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
