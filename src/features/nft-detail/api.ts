import { apiClient } from "@/api/client";
import type { NftDetail } from "@/api/contracts/nft";

export async function fetchNftDetail(nftId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<NftDetail>(`/nfts/${nftId}`, { signal });
  return data;
}

export async function addFavorite(nftId: string) {
  await apiClient.post(`/favorites/${nftId}`);
}

export async function removeFavorite(nftId: string) {
  await apiClient.delete(`/favorites/${nftId}`);
}
