import { apiClient } from "@/api/client";
import type {
  UpsertWalletRequest,
  Wallet,
  WalletSlot,
  WalletsResponse,
} from "@/api/contracts/wallets";

export async function fetchWallets(signal?: AbortSignal) {
  const { data } = await apiClient.get<WalletsResponse>("/wallets", { signal });
  return data;
}

export async function upsertWallet(slot: WalletSlot, input: UpsertWalletRequest) {
  const { data } = await apiClient.put<Wallet>(`/wallets/${slot}`, input);
  return data;
}
