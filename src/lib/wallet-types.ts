import type { WalletType } from "@/api/contracts/wallets";

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
};
