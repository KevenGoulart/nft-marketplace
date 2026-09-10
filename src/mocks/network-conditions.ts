export interface LatencyRange {
  min: number;
  max: number;
}

export interface QueuedFailure {
  method: string;
  path: string;
  status: number;
  code?: string;
  message?: string;
}

export interface QueuedDelay {
  method: string;
  path: string;
  ms: number;
}

export interface QueuedDrop {
  method: string;
  path: string;
}

interface NetworkConditionsState {
  latencyMs: LatencyRange | null;
  offline: boolean;
  failNext: QueuedFailure[];
  delayNext: QueuedDelay[];
  dropResponseOnce: QueuedDrop[];
}

function initialState(): NetworkConditionsState {
  return { latencyMs: null, offline: false, failNext: [], delayNext: [], dropResponseOnce: [] };
}

let state: NetworkConditionsState = initialState();

export function getNetworkConditions(): Readonly<NetworkConditionsState> {
  return state;
}

export function setNetworkConditions(patch: { latencyMs?: LatencyRange | null; offline?: boolean }) {
  state = { ...state, ...patch };
}

export function queueFailure(failure: QueuedFailure) {
  state.failNext.push(failure);
}

export function queueDelay(delay: QueuedDelay) {
  state.delayNext.push(delay);
}

export function queueDroppedResponse(entry: QueuedDrop) {
  state.dropResponseOnce.push(entry);
}

export function resetNetworkConditions() {
  state = initialState();
}

export function consumeMatchingFailure(method: string, pathname: string): QueuedFailure | null {
  const index = state.failNext.findIndex((f) => f.method === method && f.path === pathname);
  if (index === -1) return null;
  const [failure] = state.failNext.splice(index, 1);
  return failure;
}

export function consumeMatchingDelay(method: string, pathname: string): QueuedDelay | null {
  const index = state.delayNext.findIndex((d) => d.method === method && d.path === pathname);
  if (index === -1) return null;
  const [delay] = state.delayNext.splice(index, 1);
  return delay;
}

export function consumeDroppedResponse(method: string, pathname: string): boolean {
  const index = state.dropResponseOnce.findIndex((e) => e.method === method && e.path === pathname);
  if (index === -1) return false;
  state.dropResponseOnce.splice(index, 1);
  return true;
}

function randomInRange({ min, max }: LatencyRange) {
  return min + Math.random() * (max - min);
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function applyGlobalLatency() {
  if (state.latencyMs) {
    await sleep(randomInRange(state.latencyMs));
  }
}
