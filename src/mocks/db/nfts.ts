import type { NftListParams, NftSummary, NftDetail } from "@/api/contracts/nft";
import type { Paginated } from "@/api/contracts/common";
import { db, persistDb } from "./store";
import { nowIso } from "./crypto";
import { NotFoundError } from "./errors";
import type { NftRecord } from "./types";

type NftListener = (nft: NftSummary) => void;
const listeners = new Set<NftListener>();

export function subscribeNftUpdates(listener: NftListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(record: NftRecord) {
  const summary = toNftSummary(record, null);
  for (const listener of listeners) listener(summary);
}

function isFavorite(nftId: string, userId: string | null) {
  if (!userId) return false;
  return db.favorites.get(userId)?.has(nftId) ?? false;
}

export function toNftSummary(record: NftRecord, userId: string | null): NftSummary {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    image: record.image,
    collection: record.collection,
    network: record.network,
    priceEth: record.priceEth,
    previousPriceEth: record.previousPriceEth,
    editionsTotal: record.editionsTotal,
    editionsAvailable: record.editionsAvailable,
    isFavorite: isFavorite(record.id, userId),
    version: record.version,
    updatedAt: record.updatedAt,
  };
}

export function toNftDetail(record: NftRecord, userId: string | null): NftDetail {
  return {
    ...toNftSummary(record, userId),
    description: record.description,
    creator: record.creator,
    gallery: record.gallery,
    attributes: record.attributes,
    editionAvailable: record.editionsAvailable > 0,
  };
}

export function getNftRecord(nftId: string): NftRecord {
  const record = db.nfts.get(nftId);
  if (!record) throw new NotFoundError("NFT não encontrado");
  return record;
}

export function decrementEditions(nftId: string, quantity: number) {
  const record = db.nfts.get(nftId);
  if (!record) return;
  record.editionsAvailable = Math.max(0, record.editionsAvailable - quantity);
  record.version += 1;
  record.updatedAt = nowIso();
  persistDb();
  notify(record);
}

export function applyNftChange(
  nftId: string,
  change: { priceEth?: string; editionsAvailable?: number }
): NftSummary {
  const record = getNftRecord(nftId);
  if (change.priceEth !== undefined) {
    record.previousPriceEth = record.priceEth;
    record.priceEth = change.priceEth;
  }
  if (change.editionsAvailable !== undefined) {
    record.editionsAvailable = Math.max(0, Math.min(record.editionsTotal, change.editionsAvailable));
  }
  record.version += 1;
  record.updatedAt = nowIso();
  persistDb();
  notify(record);
  return toNftSummary(record, null);
}

export function listNfts(
  params: NftListParams,
  userId: string | null
): Paginated<NftSummary> {
  let items = Array.from(db.nfts.values());

  if (params.search) {
    const term = params.search.trim().toLowerCase();
    items = items.filter(
      (nft) =>
        nft.title.toLowerCase().includes(term) ||
        nft.collection.toLowerCase().includes(term)
    );
  }
  if (params.collection) {
    items = items.filter((nft) => nft.collection === params.collection);
  }
  if (params.network) {
    items = items.filter((nft) => nft.network === params.network);
  }
  if (params.minPrice) {
    items = items.filter((nft) => Number(nft.priceEth) >= Number(params.minPrice));
  }
  if (params.maxPrice) {
    items = items.filter((nft) => Number(nft.priceEth) <= Number(params.maxPrice));
  }

  switch (params.sort) {
    case "price_asc":
      items = [...items].sort((a, b) => Number(a.priceEth) - Number(b.priceEth));
      break;
    case "price_desc":
      items = [...items].sort((a, b) => Number(b.priceEth) - Number(a.priceEth));
      break;
    case "trending":
      items = [...items].sort(
        (a, b) => a.editionsAvailable - b.editionsAvailable
      );
      break;
    case "recent":
    default:
      items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
  }

  const total = items.length;
  const start = (params.page - 1) * params.pageSize;
  const page = items.slice(start, start + params.pageSize);

  return {
    items: page.map((record) => toNftSummary(record, userId)),
    page: params.page,
    pageSize: params.pageSize,
    total,
  };
}
