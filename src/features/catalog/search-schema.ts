import { z } from "zod";

export const CATALOG_PAGE_SIZE = 9;

const sortValues = ["recent", "price_asc", "price_desc", "trending"] as const;

export const catalogSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  collection: z.string().optional().catch(undefined),
  network: z.enum(["ethereum", "polygon", "solana"]).optional().catch(undefined),
  minPrice: z.string().optional().catch(undefined),
  maxPrice: z.string().optional().catch(undefined),
  sort: z.enum(sortValues).catch("recent").default("recent"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

export const DEFAULT_CATALOG_SEARCH: CatalogSearch = {
  sort: "recent",
  page: 1,
};
