import { Link } from "@tanstack/react-router";
import type { NftSummary } from "@/api/contracts/nft";
import { formatEth } from "@/lib/eth";

export function NftCard({ nft }: { nft: NftSummary }) {
  const soldOut = nft.editionsAvailable === 0;

  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className="group flex flex-col gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[258/300] w-full overflow-hidden rounded-xl bg-card">
        <img
          src={nft.image}
          alt=""
          loading="lazy"
          width={250}
          height={250}
          className="absolute inset-x-[1.5%] top-[9%] aspect-square rounded-2xl object-cover transition-transform group-hover:scale-[1.02]"
        />
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-1 text-xs font-bold text-foreground">
            Esgotado
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
  );
}
