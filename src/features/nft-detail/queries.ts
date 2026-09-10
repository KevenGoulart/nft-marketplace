import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { NftDetail, NftSummary } from "@/api/contracts/nft";
import { ApiRequestError, type Paginated } from "@/api/contracts/common";
import { useSession } from "@/features/auth";
import { addFavorite, fetchNftDetail, removeFavorite } from "./api";

export function nftDetailQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: ["nft", nftId],
    queryFn: ({ signal }) => fetchNftDetail(nftId, signal),
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useNftDetailQuery(nftId: string) {
  return useQuery(nftDetailQueryOptions(nftId));
}

export function useToggleFavoriteMutation(nftId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  return useMutation({
    mutationFn: (nextFavorite: boolean) =>
      nextFavorite ? addFavorite(nftId) : removeFavorite(nftId),
    onMutate: async (nextFavorite) => {
      if (!isAuthenticated) return;

      await queryClient.cancelQueries({ queryKey: ["nft", nftId] });
      await queryClient.cancelQueries({ queryKey: ["nfts"] });

      const previousDetail = queryClient.getQueryData<NftDetail>(["nft", nftId]);
      const previousLists = queryClient.getQueriesData<Paginated<NftSummary>>({
        queryKey: ["nfts"],
      });

      queryClient.setQueryData<NftDetail>(["nft", nftId], (current) =>
        current ? { ...current, isFavorite: nextFavorite } : current
      );
      queryClient.setQueriesData<Paginated<NftSummary>>(
        { queryKey: ["nfts"] },
        (current) =>
          current
            ? {
                ...current,
                items: current.items.map((item) =>
                  item.id === nftId ? { ...item, isFavorite: nextFavorite } : item
                ),
              }
            : current
      );

      return { previousDetail, previousLists };
    },
    onError: (_error, _nextFavorite, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(["nft", nftId], context.previousDetail);
      }
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["nft", nftId] });
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
    },
  });
}
