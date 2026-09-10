import { z } from "zod";
import { http, HttpResponse } from "msw";
import { resetDb } from "@/mocks/db";
import { SCENARIOS, setActiveScenario } from "@/mocks/scenarios";
import { resetNetworkConditions } from "@/mocks/network-conditions";
import { ValidationError } from "@/mocks/db/errors";
import { errorResponse } from "./respond";

const setScenarioSchema = z.object({
  scenario: z.enum(SCENARIOS),
});

export const scenarioHandlers = [
  http.post("/api/mock/reset", async () => {
    await resetDb();
    setActiveScenario("default");
    resetNetworkConditions();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/scenario", async ({ request }) => {
    const parsed = setScenarioSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Cenário inválido",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    setActiveScenario(parsed.data.scenario);
    return new HttpResponse(null, { status: 204 });
  }),
];
