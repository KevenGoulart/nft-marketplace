import type { UserRecord } from "@/mocks/db/types";
import type { User } from "@/api/contracts/session";

export function toWireUser(user: UserRecord): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    username: user.username,
    ensName: user.ensName,
    walletNickname: user.walletNickname,
    createdAt: user.createdAt,
  };
}
