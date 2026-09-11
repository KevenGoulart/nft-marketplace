import { useQuery } from "@tanstack/react-query";
import { fetchNfts } from "@/features/catalog/api";
import {
  CAROUSEL_MAX_POOL_SIZE,
  ProductCarousel,
} from "@/features/catalog/components/product-carousel";

export function CollectorsAlsoViewed({
  excludeNftIds,
  pairOnMobile,
}: {
  excludeNftIds: string[];
  pairOnMobile?: boolean;
}) {
  const excludeKey = [...excludeNftIds].sort().join(",");

  const query = useQuery({
    queryKey: ["nfts", "collectors-also-viewed", excludeKey],
    queryFn: async ({ signal }) => {
      const excluded = new Set(excludeNftIds);
      const result = await fetchNfts(
        { sort: "trending", page: 1, pageSize: CAROUSEL_MAX_POOL_SIZE + excludeNftIds.length },
        signal
      );
      return result.items.filter((nft) => !excluded.has(nft.id)).slice(0, CAROUSEL_MAX_POOL_SIZE);
    },
  });

  return (
    <ProductCarousel
      title="Colecionadores também viram"
      resetKey={excludeKey}
      pool={query.data ?? []}
      pairOnMobile={pairOnMobile}
    />
  );
}
