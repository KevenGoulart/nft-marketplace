import { z } from "zod";
import { quoteSchema } from "./quote";

export const addCartItemRequestSchema = z.object({
  nftId: z.string(),
  quantity: z.number().int().min(1).default(1),
});
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>;

export const updateCartItemRequestSchema = z.object({
  quantity: z.number().int().min(1),
});
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;

export const applyCouponRequestSchema = z.object({
  code: z.string().trim().min(1),
});
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>;

export const cartSchema = z.object({
  id: z.string(),
  quote: quoteSchema,
});
export type Cart = z.infer<typeof cartSchema>;
