import { http, HttpResponse } from "msw";
import { nftListParamsSchema } from "@/api/contracts/nft";
import { getNftRecord, getUserByToken, listNfts, toNftDetail } from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import { bearerToken, errorResponse } from "./respond";

export const nftHandlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);
    const parsed = nftListParamsSchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Parâmetros de busca inválidos",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    const user = getUserByToken(bearerToken(request));
    return HttpResponse.json(listNfts(parsed.data, user?.id ?? null));
  }),

  http.get("/api/nfts/:nftId", ({ request, params }) => {
    try {
      const user = getUserByToken(bearerToken(request));
      const record = getNftRecord(String(params.nftId));
      return HttpResponse.json(toNftDetail(record, user?.id ?? null));
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
