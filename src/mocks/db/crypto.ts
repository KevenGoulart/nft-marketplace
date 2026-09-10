export async function hashPassword(password: string, email: string) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(
  password: string,
  email: string,
  hash: string
) {
  return (await hashPassword(password, email)) === hash;
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function nowIso() {
  return new Date().toISOString();
}
