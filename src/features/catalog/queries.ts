import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { NftListParams } from "@/api/contracts/nft";
import { fetchNfts } from "./api";
import { CATALOG_PAGE_SIZE, type CatalogSearch } from "./search-schema";

function toListParams(search: CatalogSearch): NftListParams {
  return {
    search: search.q,
    collection: search.collection,
    network: search.network,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    sort: search.sort,
    page: search.page,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

export function useNftsQuery(search: CatalogSearch) {
  const params = toListParams(search);
  return useQuery({
    queryKey: ["nfts", params],
    queryFn: ({ signal }) => fetchNfts(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogFacetsQuery() {
  return useQuery({
    queryKey: ["nfts", "facets"],
    queryFn: ({ signal }) =>
      fetchNfts({ sort: "recent", page: 1, pageSize: 60 }, signal),
    staleTime: 60_000,
    select: (data) => {
      const collections = new Map<string, number>();
      const networks = new Map<string, number>();
      let minPrice = Infinity;
      let maxPrice = 0;

      for (const nft of data.items) {
        collections.set(nft.collection, (collections.get(nft.collection) ?? 0) + 1);
        networks.set(nft.network, (networks.get(nft.network) ?? 0) + 1);
        const price = Number(nft.priceEth);
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }

      return {
        collections: Array.from(collections.entries()),
        networks: Array.from(networks.entries()) as [
          "ethereum" | "polygon" | "solana",
          number,
        ][],
        minPrice: Number.isFinite(minPrice) ? minPrice : 0,
        maxPrice: maxPrice || 1,
      };
    },
  });
}
