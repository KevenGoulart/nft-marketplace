import type { CreateOrderRequest, Order } from "@/api/contracts/orders";
import { db, persistDb } from "./store";
import { newId, nowIso } from "./crypto";
import { assertAllAvailable, computeQuote } from "./quote";
import { stableStringify } from "./stable-stringify";
import {
  IdempotencyConflictError,
  NotFoundError,
  QuoteOutdatedError,
} from "./errors";
import type { OrderRecord } from "./types";
import { getCartForUser, removeCartItem } from "./cart";
import { decrementEditions } from "./nfts";
import { getActiveScenario } from "@/mocks/scenarios";

function toOrderResponse(record: OrderRecord): Order {
  return {
    id: record.id,
    status: record.status,
    quoteSnapshot: record.quoteSnapshot,
    walletId: record.walletId,
    network: record.network,
    collector: record.collector,
    transactionRef: record.transactionRef,
    explorerUrl: record.explorerUrl,
    refusalReason: record.refusalReason,
    version: record.version,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

type OrderListener = (order: Order, userId: string) => void;
const listeners = new Set<OrderListener>();

export function subscribeOrderUpdates(listener: OrderListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(record: OrderRecord) {
  for (const listener of listeners) listener(toOrderResponse(record), record.userId);
}

function findUserWallet(userId: string, walletId: string) {
  const wallets = db.wallets.get(userId);
  if (wallets?.primary?.id === walletId) return wallets.primary;
  if (wallets?.secondary?.id === walletId) return wallets.secondary;
  return null;
}

const RESOLUTION_DELAY_MS = 2500;

function resolveOrder(current: OrderRecord) {
  if (getActiveScenario() === "payment_refused") {
    current.status = "refused";
    current.refusalReason = "Pagamento recusado pela rede simulada. Tente novamente.";
    current.version += 1;
    current.updatedAt = nowIso();
    persistDb();
    notify(current);
    return;
  }

  current.transactionRef = newId("tx").replace("tx-", "0x");
  current.explorerUrl = `https://explorer.kurio.mock/tx/${current.transactionRef}`;
  current.status = "confirmed";

  const cart = getCartForUser(current.userId);
  for (const line of current.quoteSnapshot.items) {
    const item = cart.items.find((entry) => entry.nftId === line.nftId);
    if (!item) continue;
    if (item.quantity <= line.quantity) {
      removeCartItem(cart, item.id);
    } else {
      item.quantity -= line.quantity;
    }
  }

  for (const line of current.quoteSnapshot.items) {
    decrementEditions(line.nftId, line.quantity);
  }

  current.version += 1;
  current.updatedAt = nowIso();
  persistDb();
  notify(current);
}

function resolveOrderIfDue(current: OrderRecord) {
  if (current.status !== "pending") return;
  const elapsed = Date.now() - new Date(current.createdAt).getTime();
  if (elapsed < RESOLUTION_DELAY_MS) return;
  resolveOrder(current);
}

function scheduleResolution(order: OrderRecord) {
  setTimeout(() => {
    const current = db.orders.get(order.id);
    if (!current || current.status !== "pending") return;
    resolveOrder(current);
  }, RESOLUTION_DELAY_MS);
}

export function createOrder(
  userId: string,
  idempotencyKey: string,
  payload: CreateOrderRequest
): Order {
  const requestHash = stableStringify(payload);
  const dedupeKey = `${userId}:${idempotencyKey}`;
  const existingIdem = db.idempotency.get(dedupeKey);

  if (existingIdem) {
    if (existingIdem.requestHash !== requestHash) {
      throw new IdempotencyConflictError(
        "Esta chave de idempotência já foi usada com um pedido diferente"
      );
    }
    const existingOrder = db.orders.get(existingIdem.orderId);
    if (!existingOrder) throw new NotFoundError("Pedido não encontrado");
    return toOrderResponse(existingOrder);
  }

  const wallet = findUserWallet(userId, payload.walletId);
  if (!wallet) throw new NotFoundError("Carteira não encontrada");

  assertAllAvailable(payload.items);

  const currentQuote = computeQuote(payload.items, payload.couponCode);
  if (currentQuote.version !== payload.quoteVersion) {
    throw new QuoteOutdatedError(
      "O preço, o cupom ou a disponibilidade mudaram. Revise o pedido antes de confirmar."
    );
  }

  const now = nowIso();
  const order: OrderRecord = {
    id: newId("order"),
    userId,
    status: "pending",
    quoteSnapshot: currentQuote,
    walletId: payload.walletId,
    network: payload.network,
    collector: payload.collector,
    transactionRef: null,
    explorerUrl: null,
    refusalReason: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  db.orders.set(order.id, order);
  db.idempotency.set(dedupeKey, { requestHash, orderId: order.id });
  persistDb();
  scheduleResolution(order);

  return toOrderResponse(order);
}

export function getOrder(userId: string, orderId: string): Order {
  const order = db.orders.get(orderId);
  if (!order || order.userId !== userId) {
    throw new NotFoundError("Pedido não encontrado");
  }
  resolveOrderIfDue(order);
  return toOrderResponse(order);
}
