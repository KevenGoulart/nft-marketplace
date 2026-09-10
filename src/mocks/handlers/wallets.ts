import { http, HttpResponse } from "msw";
import { upsertWalletRequestSchema, walletSlotSchema } from "@/api/contracts/wallets";
import { getWallets, requireUser, upsertWallet } from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import { bearerToken, errorResponse } from "./respond";

export const walletsHandlers = [
  http.get("/api/wallets", ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      return HttpResponse.json(getWallets(user.id));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.put("/api/wallets/:slot", async ({ request, params }) => {
    const slotParsed = walletSlotSchema.safeParse(params.slot);
    const bodyParsed = upsertWalletRequestSchema.safeParse(await request.json());

    if (!slotParsed.success || !bodyParsed.success) {
      return errorResponse(
        new ValidationError(
          "Dados de carteira inválidos",
          bodyParsed.success
            ? {}
            : (bodyParsed.error.flatten().fieldErrors as Record<string, string[]>)
        )
      );
    }

    try {
      const user = requireUser(bearerToken(request));
      const wallet = upsertWallet(user.id, slotParsed.data, bodyParsed.data);
      return HttpResponse.json(wallet);
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
