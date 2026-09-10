import { useQuery } from "@tanstack/react-query";
import { fetchNfts } from "@/features/catalog/api";
import { NftCard } from "@/features/catalog/components/nft-card";

export function RelatedProducts({
  collection,
  excludeNftId,
}: {
  collection: string;
  excludeNftId: string;
}) {
  const query = useQuery({
    queryKey: ["nfts", "related", collection],
    queryFn: ({ signal }) =>
      fetchNfts({ collection, sort: "recent", page: 1, pageSize: 4 }, signal),
  });

  const items = (query.data?.items ?? []).filter((nft) => nft.id !== excludeNftId);
  if (items.length === 0) return null;

  return (
    <section aria-label="Mais desta coleção" className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-3 text-base font-bold text-foreground">
        Mais desta coleção
      </h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((nft) => (
          <NftCard key={nft.id} nft={nft} />
        ))}
      </div>
    </section>
  );
}
