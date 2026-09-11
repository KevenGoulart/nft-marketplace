import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { REALTIME_URL, type NftUpdatedEvent, type OrderUpdatedEvent } from "@/api/contracts/realtime";
import { getUserByToken, subscribeNftUpdates, subscribeOrderUpdates } from "@/mocks/db";

const realtime = ws.link(REALTIME_URL);

let sequence = 0;
function nextEventId() {
  sequence += 1;
  return `evt-${Date.now()}-${sequence}`;
}

type Connection = {
  io: ReturnType<typeof toSocketIo>;
  userId: string | null;
};

const connections = new Set<Connection>();

export function disconnectAllRealtimeClients() {
  for (const connection of connections) {
    connection.io.rawClient.close();
  }
}

export function broadcastRawNftUpdate(event: NftUpdatedEvent) {
  for (const connection of connections) {
    connection.io.client.emit("nft.updated", event);
  }
}

export { nextEventId };

subscribeNftUpdates((nft) => {
  const event: NftUpdatedEvent = {
    id: nextEventId(),
    resource: "nft",
    nftId: nft.id,
    version: nft.version,
    priceEth: nft.priceEth,
    previousPriceEth: nft.previousPriceEth,
    editionsAvailable: nft.editionsAvailable,
    updatedAt: nft.updatedAt,
  };
  for (const connection of connections) {
    connection.io.client.emit("nft.updated", event);
  }
});

subscribeOrderUpdates((order, ownerUserId) => {
  const event: OrderUpdatedEvent = {
    id: nextEventId(),
    resource: "order",
    orderId: order.id,
    version: order.version,
    status: order.status,
    updatedAt: order.updatedAt,
  };
  for (const connection of connections) {
    if (connection.userId === ownerUserId) {
      connection.io.client.emit("order.updated", event);
    }
  }
});

export const realtimeHandlers = [
  realtime.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    const token = connection.client.url.searchParams.get("token");
    const user = getUserByToken(token);
    const entry: Connection = { io, userId: user?.id ?? null };
    connections.add(entry);

    connection.client.addEventListener("close", () => {
      connections.delete(entry);
    });
  }),
];
