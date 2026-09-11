import { z } from "zod";
import { http, HttpResponse } from "msw";
import { applyNftChange } from "@/mocks/db";
import { nowIso } from "@/mocks/db/crypto";
import { ValidationError } from "@/mocks/db/errors";
import { broadcastRawNftUpdate, disconnectAllRealtimeClients, nextEventId } from "@/mocks/realtime/server";
import { errorResponse } from "./respond";

const simulateNftUpdateSchema = z.object({
  priceEth: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  editionsAvailable: z.number().int().min(0).optional(),
});

const emitRawNftUpdateSchema = z.object({
  nftId: z.string(),
  version: z.number().int(),
  priceEth: z.string().regex(/^\d+(\.\d+)?$/),
  previousPriceEth: z.string().regex(/^\d+(\.\d+)?$/).nullable(),
  editionsAvailable: z.number().int().min(0),
});

export const realtimeTestHandlers = [
  http.post("/api/mock/nfts/:nftId/simulate-update", async ({ request, params }) => {
    const parsed = simulateNftUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Alteração de NFT inválida",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const nft = applyNftChange(String(params.nftId), parsed.data);
      return HttpResponse.json(nft);
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/mock/realtime/disconnect-all", () => {
    disconnectAllRealtimeClients();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/mock/realtime/emit-nft-update", async ({ request }) => {
    const parsed = emitRawNftUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Evento simulado inválido",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    broadcastRawNftUpdate({
      id: nextEventId(),
      resource: "nft",
      nftId: parsed.data.nftId,
      version: parsed.data.version,
      priceEth: parsed.data.priceEth,
      previousPriceEth: parsed.data.previousPriceEth,
      editionsAvailable: parsed.data.editionsAvailable,
      updatedAt: nowIso(),
    });
    return new HttpResponse(null, { status: 204 });
  }),
];
