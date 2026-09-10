import { apiClient } from "@/api/client";
import type { NftListParams, NftSummary } from "@/api/contracts/nft";
import type { Paginated } from "@/api/contracts/common";

export async function fetchNfts(params: NftListParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<Paginated<NftSummary>>("/nfts", {
    params,
    signal,
  });
  return data;
}
