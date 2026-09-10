import type { UpsertWalletRequest, WalletSlot } from "@/api/contracts/wallets";
import { db, persistDb } from "./store";
import { newId, nowIso } from "./crypto";
import type { WalletRecord } from "./types";

export function getWallets(userId: string) {
  return db.wallets.get(userId) ?? { primary: null, secondary: null };
}

export function upsertWallet(
  userId: string,
  slot: WalletSlot,
  input: UpsertWalletRequest
): WalletRecord {
  const current = db.wallets.get(userId) ?? { primary: null, secondary: null };
  const wallet: WalletRecord = {
    id: current[slot]?.id ?? newId("wallet"),
    slot,
    address: input.address,
    network: input.network,
    label: input.label,
    connectedAt: current[slot]?.connectedAt ?? nowIso(),
  };
  current[slot] = wallet;
  db.wallets.set(userId, current);
  persistDb();
  return wallet;
}
