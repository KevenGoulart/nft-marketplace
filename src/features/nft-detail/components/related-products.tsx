import { useQuery } from "@tanstack/react-query";
import { fetchNfts } from "@/features/catalog/api";
import {
  CAROUSEL_MAX_POOL_SIZE,
  ProductCarousel,
} from "@/features/catalog/components/product-carousel";

export function RelatedProducts({
  collection,
  excludeNftId,
}: {
  collection: string;
  excludeNftId: string;
}) {
  const query = useQuery({
    queryKey: ["nfts", "related", collection, excludeNftId],
    queryFn: async ({ signal }) => {
      const primary = await fetchNfts(
        { collection, sort: "recent", page: 1, pageSize: CAROUSEL_MAX_POOL_SIZE },
        signal
      );
      const items = primary.items.filter((nft) => nft.id !== excludeNftId);

      if (items.length < CAROUSEL_MAX_POOL_SIZE) {
        const seen = new Set([excludeNftId, ...items.map((nft) => nft.id)]);
        const fallback = await fetchNfts(
          { sort: "trending", page: 1, pageSize: CAROUSEL_MAX_POOL_SIZE },
          signal
        );
        for (const nft of fallback.items) {
          if (items.length >= CAROUSEL_MAX_POOL_SIZE) break;
          if (seen.has(nft.id)) continue;
          items.push(nft);
          seen.add(nft.id);
        }
      }

      return items.slice(0, CAROUSEL_MAX_POOL_SIZE);
    },
  });

  return (
    <ProductCarousel
      title="Mais desta coleção"
      resetKey={`${collection}:${excludeNftId}`}
      pool={query.data ?? []}
      pairOnMobile
    />
  );
}
