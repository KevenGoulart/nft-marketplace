import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { loadPersistedScenario } from "./scenarios";

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  loadPersistedScenario();
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
