import type { Cart } from "@/api/contracts/cart";
import { db, persistDb } from "./store";
import { newId } from "./crypto";
import { getNftRecord } from "./nfts";
import { assertAvailable, computeQuote } from "./quote";
import { NotFoundError } from "./errors";
import type { CartRecord } from "./types";

function createCart(ownerUserId: string | null): CartRecord {
  const cart: CartRecord = {
    id: newId("cart"),
    ownerUserId,
    items: [],
    couponCode: null,
  };
  db.carts.set(cart.id, cart);
  if (ownerUserId) db.cartsByUser.set(ownerUserId, cart.id);
  persistDb();
  return cart;
}

export function getCartForUser(userId: string): CartRecord {
  const existingId = db.cartsByUser.get(userId);
  const existing = existingId ? db.carts.get(existingId) : undefined;
  return existing ?? createCart(userId);
}

export function getOrCreateGuestCart(guestCartId: string | null): CartRecord {
  if (guestCartId) {
    const existing = db.carts.get(guestCartId);
    if (existing) return existing;
  }
  return createCart(null);
}

export function toCartResponse(cart: CartRecord): Cart {
  const quote = computeQuote(
    cart.items.map((item) => ({
      itemId: item.id,
      nftId: item.nftId,
      quantity: item.quantity,
    })),
    cart.couponCode ?? undefined
  );
  return { id: cart.id, quote };
}

export function addCartItem(cart: CartRecord, nftId: string, quantity: number) {
  const record = getNftRecord(nftId);
  const existing = cart.items.find((item) => item.nftId === nftId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  assertAvailable(record, nextQuantity);

  if (existing) {
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({ id: newId("item"), nftId, quantity });
  }
  persistDb();
}

export function updateCartItem(cart: CartRecord, itemId: string, quantity: number) {
  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) throw new NotFoundError("Item não encontrado no carrinho");
  const record = getNftRecord(item.nftId);
  assertAvailable(record, quantity);
  item.quantity = quantity;
  persistDb();
}

export function removeCartItem(cart: CartRecord, itemId: string) {
  const index = cart.items.findIndex((entry) => entry.id === itemId);
  if (index === -1) throw new NotFoundError("Item não encontrado no carrinho");
  cart.items.splice(index, 1);
  persistDb();
}

export function applyCoupon(cart: CartRecord, code: string) {
  const normalized = code.trim().toUpperCase();
  computeQuote(
    cart.items.map((item) => ({ nftId: item.nftId, quantity: item.quantity })),
    normalized
  );
  cart.couponCode = normalized;
  persistDb();
}

export function removeCoupon(cart: CartRecord) {
  cart.couponCode = null;
  persistDb();
}

export function mergeGuestCartIntoUser(guestCartId: string, userId: string) {
  const guestCart = db.carts.get(guestCartId);
  const userCart = getCartForUser(userId);
  if (!guestCart || guestCart.id === userCart.id) return userCart;

  for (const guestItem of guestCart.items) {
    const record = getNftRecord(guestItem.nftId);
    const existing = userCart.items.find((item) => item.nftId === guestItem.nftId);
    const merged = Math.min(
      (existing?.quantity ?? 0) + guestItem.quantity,
      record.editionsAvailable
    );
    if (merged <= 0) {
      if (existing) removeCartItem(userCart, existing.id);
      continue;
    }
    if (existing) {
      existing.quantity = merged;
    } else {
      userCart.items.push({ id: newId("item"), nftId: guestItem.nftId, quantity: merged });
    }
  }

  db.carts.delete(guestCart.id);
  persistDb();
  return userCart;
}
