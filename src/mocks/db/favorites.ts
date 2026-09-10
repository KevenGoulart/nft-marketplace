import { db, persistDb } from "./store";
import { ConflictError, NotFoundError } from "./errors";
import { getNftRecord, toNftSummary } from "./nfts";

function favoriteSet(userId: string) {
  let set = db.favorites.get(userId);
  if (!set) {
    set = new Set();
    db.favorites.set(userId, set);
  }
  return set;
}

export function listFavorites(userId: string) {
  const ids = favoriteSet(userId);
  return Array.from(ids)
    .map((id) => db.nfts.get(id))
    .filter((record): record is NonNullable<typeof record> => Boolean(record))
    .map((record) => toNftSummary(record, userId));
}

export function addFavorite(userId: string, nftId: string) {
  getNftRecord(nftId);
  const set = favoriteSet(userId);
  if (set.has(nftId)) {
    throw new ConflictError("NFT já está nos favoritos");
  }
  set.add(nftId);
  persistDb();
}

export function removeFavorite(userId: string, nftId: string) {
  const set = favoriteSet(userId);
  if (!set.has(nftId)) {
    throw new NotFoundError("NFT não está nos favoritos");
  }
  set.delete(nftId);
  persistDb();
}
