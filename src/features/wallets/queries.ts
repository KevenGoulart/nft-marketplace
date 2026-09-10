import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpsertWalletRequest, WalletSlot } from "@/api/contracts/wallets";
import { fetchWallets, upsertWallet } from "./api";

export const walletsQueryKey = ["wallets"] as const;

export function useWalletsQuery() {
  return useQuery({
    queryKey: walletsQueryKey,
    queryFn: ({ signal }) => fetchWallets(signal),
  });
}

export function useUpsertWalletMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot, input }: { slot: WalletSlot; input: UpsertWalletRequest }) =>
      upsertWallet(slot, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsQueryKey });
    },
  });
}
