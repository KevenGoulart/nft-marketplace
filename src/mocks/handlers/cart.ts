import { http, HttpResponse } from "msw";
import {
  addCartItemRequestSchema,
  applyCouponRequestSchema,
  updateCartItemRequestSchema,
} from "@/api/contracts/cart";
import {
  addCartItem,
  applyCoupon,
  getCartForUser,
  getOrCreateGuestCart,
  getUserByToken,
  mergeGuestCartIntoUser,
  removeCartItem,
  removeCoupon,
  requireUser,
  toCartResponse,
  updateCartItem,
} from "@/mocks/db";
import { ValidationError } from "@/mocks/db/errors";
import type { CartRecord } from "@/mocks/db/types";
import { bearerToken, errorResponse } from "./respond";

const GUEST_CART_HEADER = "X-Guest-Cart-Id";

function resolveCart(request: Request): CartRecord {
  const user = getUserByToken(bearerToken(request));
  if (user) return getCartForUser(user.id);
  return getOrCreateGuestCart(request.headers.get(GUEST_CART_HEADER));
}

export const cartHandlers = [
  http.get("/api/cart", ({ request }) => {
    return HttpResponse.json(toCartResponse(resolveCart(request)));
  }),

  http.post("/api/cart/items", async ({ request }) => {
    const parsed = addCartItemRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Item de carrinho inválido",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const cart = resolveCart(request);
      addCartItem(cart, parsed.data.nftId, parsed.data.quantity);
      return HttpResponse.json(toCartResponse(cart));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.patch("/api/cart/items/:itemId", async ({ request, params }) => {
    const parsed = updateCartItemRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Quantidade inválida",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const cart = resolveCart(request);
      updateCartItem(cart, String(params.itemId), parsed.data.quantity);
      return HttpResponse.json(toCartResponse(cart));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.delete("/api/cart/items/:itemId", ({ request, params }) => {
    try {
      const cart = resolveCart(request);
      removeCartItem(cart, String(params.itemId));
      return HttpResponse.json(toCartResponse(cart));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.post("/api/cart/coupon", async ({ request }) => {
    const parsed = applyCouponRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        new ValidationError(
          "Cupom inválido",
          parsed.error.flatten().fieldErrors as Record<string, string[]>
        )
      );
    }
    try {
      const cart = resolveCart(request);
      applyCoupon(cart, parsed.data.code);
      return HttpResponse.json(toCartResponse(cart));
    } catch (error) {
      return errorResponse(error);
    }
  }),

  http.delete("/api/cart/coupon", ({ request }) => {
    const cart = resolveCart(request);
    removeCoupon(cart);
    return HttpResponse.json(toCartResponse(cart));
  }),

  http.post("/api/cart/merge", async ({ request }) => {
    try {
      const user = requireUser(bearerToken(request));
      const body = (await request.json()) as { guestCartId?: string };
      if (body.guestCartId) {
        mergeGuestCartIntoUser(body.guestCartId, user.id);
      }
      return HttpResponse.json(toCartResponse(getCartForUser(user.id)));
    } catch (error) {
      return errorResponse(error);
    }
  }),
];
