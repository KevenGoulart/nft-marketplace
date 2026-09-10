import { z } from "zod";
import { ethAmountSchema } from "./common";

export const quoteLineItemInputSchema = z.object({
  itemId: z.string().optional(),
  nftId: z.string(),
  quantity: z.number().int().min(1),
});
export type QuoteLineItemInput = z.infer<typeof quoteLineItemInputSchema>;

export const quoteRequestSchema = z.object({
  items: z.array(quoteLineItemInputSchema).min(1),
  couponCode: z.string().trim().optional(),
});
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export const quoteLineItemSchema = z.object({
  itemId: z.string().optional(),
  nftId: z.string(),
  title: z.string(),
  image: z.string(),
  unitPriceEth: ethAmountSchema,
  quantity: z.number().int(),
  editionsAvailable: z.number().int(),
  lineTotalEth: ethAmountSchema,
});
export type QuoteLineItem = z.infer<typeof quoteLineItemSchema>;

export const appliedCouponSchema = z.object({
  code: z.string(),
  label: z.string(),
  discountEth: ethAmountSchema,
});
export type AppliedCoupon = z.infer<typeof appliedCouponSchema>;

export const quoteSchema = z.object({
  version: z.number().int(),
  items: z.array(quoteLineItemSchema),
  appliedCoupon: appliedCouponSchema.nullable(),
  subtotalEth: ethAmountSchema,
  discountEth: ethAmountSchema,
  networkFeeEth: ethAmountSchema,
  totalEth: ethAmountSchema,
  generatedAt: z.iso.datetime(),
});
export type Quote = z.infer<typeof quoteSchema>;
