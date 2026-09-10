import { http, HttpResponse } from "msw";
import { quoteRequestSchema } from "@/api/contracts/quote";
import { computeQuote } from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import { errorResponse } from "./respond";

export const quoteHandlers = [
  http.post("/api/quote", async ({ request }) => {
    const parsed = quoteRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Itens de cotação inválidos",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const quote = computeQuote(parsed.data.items, parsed.data.couponCode);
      return HttpResponse.json(quote);
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
