const STORAGE_KEY = "kurio.checkout.pending";

type PendingCheckout = {
  idempotencyKey: string;
  userId: string;
  orderId?: string;
};

function read(): PendingCheckout | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckout;
  } catch {
    return null;
  }
}

function write(value: PendingCheckout) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getPendingCheckout(userId: string): PendingCheckout | null {
  const current = read();
  return current && current.userId === userId ? current : null;
}

export function ensureIdempotencyKey(userId: string): string {
  const current = read();
  if (current?.userId === userId && current.idempotencyKey) return current.idempotencyKey;
  const key = crypto.randomUUID();
  write({ idempotencyKey: key, userId });
  return key;
}

export function setPendingOrderId(userId: string, orderId: string) {
  const current = read();
  write({
    idempotencyKey: current?.userId === userId ? current.idempotencyKey : crypto.randomUUID(),
    userId,
    orderId,
  });
}

export function clearPendingCheckout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function clearPendingCheckoutIfOtherUser(userId: string) {
  const current = read();
  if (current && current.userId !== userId) clearPendingCheckout();
}
