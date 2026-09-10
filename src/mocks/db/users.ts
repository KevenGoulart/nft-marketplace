import { db, persistDb } from "./store";
import { hashPassword, newId, nowIso, verifyPassword } from "./crypto";
import { ConflictError, UnauthenticatedError, ValidationError } from "./errors";
import type { UserRecord } from "./types";

export function findUserById(userId: string): UserRecord | null {
  return db.users.get(userId) ?? null;
}

export function findUserByEmail(email: string): UserRecord | null {
  const id = db.usersByEmail.get(email.toLowerCase());
  return id ? (db.users.get(id) ?? null) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserRecord> {
  if (findUserByEmail(input.email)) {
    throw new ConflictError("Já existe uma conta com este e-mail");
  }

  const user: UserRecord = {
    id: newId("user"),
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password, input.email),
    avatarUrl: null,
    createdAt: nowIso(),
  };
  db.users.set(user.id, user);
  db.usersByEmail.set(user.email.toLowerCase(), user.id);
  db.favorites.set(user.id, new Set());
  db.wallets.set(user.id, { primary: null, secondary: null });
  persistDb();
  return user;
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<UserRecord> {
  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.email, user.passwordHash))) {
    throw new UnauthenticatedError("E-mail ou senha inválidos");
  }
  return user;
}

export function createSessionToken(userId: string): string {
  const token = newId("token");
  db.tokens.set(token, userId);
  persistDb();
  return token;
}

export function getUserByToken(token: string | null): UserRecord | null {
  if (!token) return null;
  const userId = db.tokens.get(token);
  return userId ? findUserById(userId) : null;
}

export function revokeToken(token: string) {
  db.tokens.delete(token);
  persistDb();
}

export function requireUser(token: string | null): UserRecord {
  const user = getUserByToken(token);
  if (!user) {
    throw new UnauthenticatedError("Sessão expirada ou inválida");
  }
  return user;
}

export function updateProfile(
  userId: string,
  patch: { name?: string; email?: string; avatarUrl?: string | null }
): UserRecord {
  const user = findUserById(userId);
  if (!user) throw new UnauthenticatedError("Sessão expirada ou inválida");

  if (patch.email && patch.email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = findUserByEmail(patch.email);
    if (existing && existing.id !== userId) {
      throw new ValidationError("E-mail já está em uso", {
        email: ["Este e-mail já está sendo usado por outra conta"],
      });
    }
    db.usersByEmail.delete(user.email.toLowerCase());
    user.email = patch.email;
    db.usersByEmail.set(user.email.toLowerCase(), user.id);
  }
  if (patch.name) user.name = patch.name;
  if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl;

  persistDb();
  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = findUserById(userId);
  if (!user) throw new UnauthenticatedError("Sessão expirada ou inválida");

  const matches = await verifyPassword(currentPassword, user.email, user.passwordHash);
  if (!matches) {
    throw new ValidationError("Senha atual incorreta", {
      currentPassword: ["Senha atual incorreta"],
    });
  }

  user.passwordHash = await hashPassword(newPassword, user.email);
  persistDb();
}
