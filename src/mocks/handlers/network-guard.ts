import { http, HttpResponse } from "msw";
import {
  applyGlobalLatency,
  consumeMatchingDelay,
  consumeMatchingFailure,
  getNetworkConditions,
  sleep,
} from "@/mocks/network-conditions";

export const networkGuardHandlers = [
  http.all("*", async ({ request }) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/mock/")) {
      return;
    }

    const conditions = getNetworkConditions();
    const method = request.method;

    if (conditions.offline) {
      return HttpResponse.error();
    }

    const delay = consumeMatchingDelay(method, url.pathname);
    if (delay) {
      await sleep(delay.ms);
    }

    const failure = consumeMatchingFailure(method, url.pathname);
    if (failure) {
      await applyGlobalLatency();
      return HttpResponse.json(
        {
          error: {
            code: failure.code ?? "TRANSIENT_FAILURE",
            message: failure.message ?? "Falha simulada de rede",
          },
        },
        { status: failure.status }
      );
    }

    await applyGlobalLatency();
    return;
  }),
];
