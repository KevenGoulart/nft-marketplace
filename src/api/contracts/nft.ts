import { z } from "zod";
import { ethAmountSchema, networkSchema } from "./common";

export const nftSortSchema = z
  .enum(["recent", "price_asc", "price_desc", "trending"])
  .default("recent");
export type NftSort = z.infer<typeof nftSortSchema>;

export const nftListParamsSchema = z.object({
  search: z.string().trim().optional(),
  collection: z.string().optional(),
  network: networkSchema.optional(),
  minPrice: ethAmountSchema.optional(),
  maxPrice: ethAmountSchema.optional(),
  sort: nftSortSchema,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(12),
});
export type NftListParams = z.infer<typeof nftListParamsSchema>;

export const nftSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  image: z.string(),
  collection: z.string(),
  network: networkSchema,
  priceEth: ethAmountSchema,
  previousPriceEth: ethAmountSchema.nullable(),
  editionsTotal: z.number().int(),
  editionsAvailable: z.number().int(),
  isFavorite: z.boolean(),
  version: z.number().int(),
  updatedAt: z.iso.datetime(),
});
export type NftSummary = z.infer<typeof nftSummarySchema>;

export const nftAttributeSchema = z.object({
  trait: z.string(),
  value: z.string(),
});

export const nftDetailSchema = nftSummarySchema.extend({
  description: z.string(),
  creator: z.object({ name: z.string(), avatarUrl: z.string() }),
  gallery: z.array(z.string()).min(1),
  attributes: z.array(nftAttributeSchema),
  editionAvailable: z.boolean(),
});
export type NftDetail = z.infer<typeof nftDetailSchema>;
