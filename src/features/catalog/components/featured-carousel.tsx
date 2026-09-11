import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNfts } from "../api";

export function FeaturedCarousel() {
  const query = useQuery({
    queryKey: ["nfts", "featured"],
    queryFn: ({ signal }) => fetchNfts({ sort: "trending", page: 1, pageSize: 1 }, signal),
    staleTime: 60_000,
  });

  if (query.isError || (query.isSuccess && query.data.items.length === 0)) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-xl bg-card pt-6">
      <div className="flex w-full flex-col gap-4 px-5">
        <p className="text-2xl font-bold leading-8 text-accent">NFT EM DESTAQUE</p>
        <p className="text-center text-[22px] font-bold leading-4 text-foreground">
          OFERTA LIMITADA
        </p>
      </div>

      {query.isPending ? (
        <Skeleton className="h-[368px] w-full rounded-[22px]" />
      ) : (
        <Link
          to="/nft/$nftId"
          params={{ nftId: query.data.items[0].id }}
          className="relative block h-[368px] w-full overflow-hidden rounded-[22px]"
        >
          <img
            src={query.data.items[0].image}
            alt={query.data.items[0].title}
            className="size-full object-cover"
          />
        </Link>
      )}

      <div className="pointer-events-none absolute left-[38px] top-[105px] size-[15px] rounded-full bg-gradient-to-br from-primary/30 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-[299px] size-[22px] rounded-lg border-2 border-[#46a358] opacity-20" />
      <div className="pointer-events-none absolute left-[248px] top-[343px] size-[45px] rounded-full bg-gradient-to-br from-primary/30 to-transparent" />
    </div>
  );
}
