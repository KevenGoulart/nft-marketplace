import { z } from "zod";
import { http, HttpResponse } from "msw";
import {
  queueDelay,
  queueDroppedResponse,
  queueFailure,
  resetNetworkConditions,
  setNetworkConditions,
} from "@/mocks/network-conditions";
import { ValidationError } from "@/mocks/db/errors";
import { errorResponse } from "./respond";

const latencySchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .refine((v) => v.max >= v.min, { message: "max deve ser maior ou igual a min" });

const conditionsSchema = z.object({
  latencyMs: latencySchema.nullable().optional(),
  offline: z.boolean().optional(),
});

const targetSchema = z.object({
  method: z.string(),
  path: z.string(),
});

const failureSchema = targetSchema.extend({
  status: z.number().int(),
  code: z.string().optional(),
  message: z.string().optional(),
});

const delaySchema = targetSchema.extend({
  ms: z.number().min(0),
});

function parseOrError<T>(schema: z.ZodType<T>, body: unknown) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      error: errorResponse(
        new ValidationError(
          "Corpo da requisição inválido",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      ),
    } as const;
  }
  return { data: parsed.data } as const;
}

export const networkControlHandlers = [
  http.post("/api/mock/network", async ({ request }) => {
    const result = parseOrError(conditionsSchema, await request.json());
    if ("error" in result) return result.error;
    setNetworkConditions(result.data);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/network/fail-next", async ({ request }) => {
    const result = parseOrError(failureSchema, await request.json());
    if ("error" in result) return result.error;
    queueFailure(result.data);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/network/delay-next", async ({ request }) => {
    const result = parseOrError(delaySchema, await request.json());
    if ("error" in result) return result.error;
    queueDelay(result.data);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/network/drop-next", async ({ request }) => {
    const result = parseOrError(targetSchema, await request.json());
    if ("error" in result) return result.error;
    queueDroppedResponse(result.data);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/network/reset", async () => {
    resetNetworkConditions();
    return new HttpResponse(null, { status: 204 });
  }),
];
