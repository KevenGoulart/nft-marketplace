import type {
  CouponRecord,
  CartRecord,
  IdempotencyRecord,
  NftRecord,
  OrderRecord,
  UserRecord,
  WalletRecord,
} from "./types";
import { buildNftSeed } from "./seed-nfts";
import { hashPassword, newId, nowIso } from "./crypto";

export interface DbState {
  users: Map<string, UserRecord>;
  usersByEmail: Map<string, string>;
  tokens: Map<string, string>;
  nfts: Map<string, NftRecord>;
  favorites: Map<string, Set<string>>;
  carts: Map<string, CartRecord>;
  cartsByUser: Map<string, string>;
  coupons: Map<string, CouponRecord>;
  orders: Map<string, OrderRecord>;
  idempotency: Map<string, IdempotencyRecord>;
  wallets: Map<string, { primary: WalletRecord | null; secondary: WalletRecord | null }>;
}

function emptyState(): DbState {
  return {
    users: new Map(),
    usersByEmail: new Map(),
    tokens: new Map(),
    nfts: new Map(),
    favorites: new Map(),
    carts: new Map(),
    cartsByUser: new Map(),
    coupons: new Map(),
    orders: new Map(),
    idempotency: new Map(),
    wallets: new Map(),
  };
}

export let db: DbState = emptyState();

const STORAGE_KEY = "kurio.mock.db.v4";

function serialize(state: DbState): string {
  return JSON.stringify({
    users: Array.from(state.users.entries()),
    usersByEmail: Array.from(state.usersByEmail.entries()),
    tokens: Array.from(state.tokens.entries()),
    nfts: Array.from(state.nfts.entries()),
    favorites: Array.from(state.favorites.entries()).map(([userId, ids]) => [
      userId,
      Array.from(ids),
    ]),
    carts: Array.from(state.carts.entries()),
    cartsByUser: Array.from(state.cartsByUser.entries()),
    coupons: Array.from(state.coupons.entries()),
    orders: Array.from(state.orders.entries()),
    idempotency: Array.from(state.idempotency.entries()),
    wallets: Array.from(state.wallets.entries()),
  });
}

function deserialize(json: string): DbState {
  const raw = JSON.parse(json);
  return {
    users: new Map(raw.users),
    usersByEmail: new Map(raw.usersByEmail),
    tokens: new Map(raw.tokens),
    nfts: new Map(raw.nfts),
    favorites: new Map(
      raw.favorites.map(([userId, ids]: [string, string[]]) => [userId, new Set(ids)])
    ),
    carts: new Map(raw.carts),
    cartsByUser: new Map(raw.cartsByUser),
    coupons: new Map(raw.coupons),
    orders: new Map(raw.orders),
    idempotency: new Map(raw.idempotency),
    wallets: new Map(raw.wallets),
  };
}

export function persistDb() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(db));
  } catch {
  }
}

function loadPersistedDb(): DbState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return deserialize(raw);
  } catch {
    return null;
  }
}

export const SEED_PASSWORD = "kurio123!";

async function seedUser(
  state: DbState,
  input: { id: string; name: string; email: string; avatarUrl: string | null }
) {
  const passwordHash = await hashPassword(SEED_PASSWORD, input.email);
  const user: UserRecord = {
    id: input.id,
    name: input.name,
    email: input.email,
    passwordHash,
    avatarUrl: input.avatarUrl,
    createdAt: "2026-01-10T09:00:00.000Z",
  };
  state.users.set(user.id, user);
  state.usersByEmail.set(user.email.toLowerCase(), user.id);
  return user;
}

function createCartForUser(state: DbState, userId: string): CartRecord {
  const cart: CartRecord = {
    id: newId("cart"),
    ownerUserId: userId,
    items: [],
    couponCode: null,
  };
  state.carts.set(cart.id, cart);
  state.cartsByUser.set(userId, cart.id);
  return cart;
}

export async function resetDb() {
  const state = emptyState();

  for (const nft of buildNftSeed()) {
    state.nfts.set(nft.id, nft);
  }

  state.coupons.set("BEMVINDO10", {
    code: "BEMVINDO10",
    label: "10% de desconto de boas-vindas",
    discountPercent: 0.1,
    expiresAt: null,
    active: true,
  });
  state.coupons.set("EXPIRADA5", {
    code: "EXPIRADA5",
    label: "Promoção encerrada",
    discountPercent: 0.05,
    expiresAt: "2026-01-01T00:00:00.000Z",
    active: true,
  });

  const ana = await seedUser(state, {
    id: "user-ana",
    name: "Ana Souza",
    email: "ana@kurio.test",
    avatarUrl: null,
  });
  const bruno = await seedUser(state, {
    id: "user-bruno",
    name: "Bruno Lima",
    email: "bruno@kurio.test",
    avatarUrl: null,
  });

  state.favorites.set(ana.id, new Set(["nft-1", "nft-5", "nft-12"]));
  state.favorites.set(bruno.id, new Set());

  const anaCart = createCartForUser(state, ana.id);
  anaCart.items = [
    { id: newId("item"), nftId: "nft-3", quantity: 2 },
    { id: newId("item"), nftId: "nft-10", quantity: 1 },
  ];
  createCartForUser(state, bruno.id);

  state.wallets.set(ana.id, {
    primary: {
      id: newId("wallet"),
      slot: "primary",
      address: "0xA1b2C3d4E5f6A1b2C3d4E5f6A1b2C3d4E5f6A1b2",
      network: "ethereum",
      label: "Carteira principal",
      connectedAt: nowIso(),
    },
    secondary: null,
  });
  state.wallets.set(bruno.id, { primary: null, secondary: null });

  db = state;
  persistDb();
  return db;
}

const persisted = loadPersistedDb();
if (persisted) {
  db = persisted;
} else {
  await resetDb();
}
