import { http, HttpResponse } from "msw";
import { createOrderRequestSchema } from "@/api/contracts/orders";
import { createOrder, getOrder, requireUser } from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import { consumeDroppedResponse } from "@/mocks/network-conditions";
import { bearerToken, errorResponse } from "./respond";

const IDEMPOTENCY_HEADER = "Idempotency-Key";

export const orderHandlers = [
  http.post("/api/orders", async ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER);
      if (!idempotencyKey) {
        return errorResponse(
          new ValidationError("Cabeçalho Idempotency-Key é obrigatório", {
            idempotencyKey: ["Cabeçalho Idempotency-Key é obrigatório"],
          })
        );
      }

      const parsed = createOrderRequestSchema.safeParse(await request.json());
      if (!parsed.success) {
        return errorResponse(
          new ValidationError(
            "Dados do pedido inválidos",
            parsed.error.flatten().fieldErrors as Record<string, string[]>
          )
        );
      }

      const order = createOrder(user.id, idempotencyKey, parsed.data);

      const url = new URL(request.url);
      if (consumeDroppedResponse("POST", url.pathname)) {
        return HttpResponse.error();
      }

      return HttpResponse.json(order, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.get("/api/orders/:orderId", ({ request, params }) => {
    try {
      const user = requireUser(bearerToken(request));
      const order = getOrder(user.id, String(params.orderId));
      return HttpResponse.json(order);
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
