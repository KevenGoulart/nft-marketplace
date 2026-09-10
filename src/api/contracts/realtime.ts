import { z } from "zod";
import { ethAmountSchema } from "./common";
import { orderStatusSchema } from "./orders";

export const REALTIME_URL = "ws://example.com";

export const nftUpdatedEventSchema = z.object({
  id: z.string(),
  resource: z.literal("nft"),
  nftId: z.string(),
  version: z.number().int(),
  priceEth: ethAmountSchema,
  previousPriceEth: ethAmountSchema.nullable(),
  editionsAvailable: z.number().int(),
  updatedAt: z.iso.datetime(),
});
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>;

export const orderUpdatedEventSchema = z.object({
  id: z.string(),
  resource: z.literal("order"),
  orderId: z.string(),
  version: z.number().int(),
  status: orderStatusSchema,
  updatedAt: z.iso.datetime(),
});
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>;
