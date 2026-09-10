import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { loadPersistedScenario } from "./scenarios";
import { loadPersistedNetworkConditions } from "./network-conditions";

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  loadPersistedScenario();
  loadPersistedNetworkConditions();
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
