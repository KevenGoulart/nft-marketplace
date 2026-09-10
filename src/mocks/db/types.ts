import type { Network } from "@/api/contracts/common";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface NftRecord {
  id: string;
  slug: string;
  title: string;
  image: string;
  gallery: string[];
  collection: string;
  network: Network;
  priceEth: string;
  previousPriceEth: string | null;
  editionsTotal: number;
  editionsAvailable: number;
  description: string;
  creator: { name: string; avatarUrl: string };
  attributes: { trait: string; value: string }[];
  version: number;
  updatedAt: string;
}

export interface CartItemRecord {
  id: string;
  nftId: string;
  quantity: number;
}

export interface CartRecord {
  id: string;
  ownerUserId: string | null;
  items: CartItemRecord[];
  couponCode: string | null;
}

export interface CouponRecord {
  code: string;
  label: string;
  discountPercent: number;
  expiresAt: string | null;
  active: boolean;
}

export type OrderStatus = "pending" | "confirmed" | "refused";

export interface OrderRecord {
  id: string;
  userId: string;
  status: OrderStatus;
  quoteSnapshot: import("@/api/contracts/quote").Quote;
  walletId: string;
  network: Network;
  collector: import("@/api/contracts/orders").CollectorInfo;
  transactionRef: string | null;
  explorerUrl: string | null;
  refusalReason: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdempotencyRecord {
  requestHash: string;
  orderId: string;
}

export interface WalletRecord {
  id: string;
  slot: "primary" | "secondary";
  address: string;
  network: Network;
  label: string;
  connectedAt: string;
}
