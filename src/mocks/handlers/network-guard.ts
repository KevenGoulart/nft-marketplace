import { http, HttpResponse } from "msw";
import {
  applyGlobalLatency,
  consumeMatchingDelay,
  consumeMatchingFailure,
  getNetworkConditions,
  sleep,
} from "@/mocks/network-conditions";

/**
 * Middleware global de caos de rede. Registrado antes de todos os handlers de
 * negócio: aplica latência/timeout/offline e então declina (retorna undefined)
 * para deixar o handler real da rota processar a requisição normalmente. Só
 * `/api/mock/*` fica de fora — os endpoints de controle do próprio caos
 * precisam responder de forma sempre confiável.
 */
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
