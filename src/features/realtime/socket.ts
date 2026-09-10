import type { Socket } from "socket.io-client";
import { REALTIME_URL } from "@/api/contracts/realtime";
import { getAuthToken } from "@/api/client";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;
let hasConnectedBefore = false;

const reconnectHandlers = new Set<() => void>();

function currentAuthQuery() {
  return { token: getAuthToken() ?? "" };
}

export function getRealtimeSocket(): Promise<Socket> {
  if (socket) return Promise.resolve(socket);
  if (connecting) return connecting;

  connecting = import("socket.io-client").then(({ io }) => {
    const instance = io(REALTIME_URL, {
      transports: ["websocket"],
      query: currentAuthQuery(),
    });

    instance.on("connect", () => {
      if (hasConnectedBefore) {
        reconnectHandlers.forEach((handler) => handler());
      }
      hasConnectedBefore = true;
    });

    socket = instance;
    return instance;
  });

  return connecting;
}

export function onRealtimeReconnect(handler: () => void) {
  reconnectHandlers.add(handler);
  return () => reconnectHandlers.delete(handler);
}

export function resyncRealtimeAuth() {
  if (!socket) return;
  socket.io.opts.query = currentAuthQuery();
  socket.disconnect();
  socket.connect();
}
