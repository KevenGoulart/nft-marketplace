import { z } from "zod";

export const ethAmountSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Valor em ETH inválido");
export type EthAmount = z.infer<typeof ethAmountSchema>;

export const networkSchema = z.enum(["ethereum", "polygon", "solana"]);
export type Network = z.infer<typeof networkSchema>;

export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(60).default(12),
});
export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
  });
export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "VALIDATION_ERROR",
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "AVAILABILITY_CONFLICT",
      "IDEMPOTENCY_CONFLICT",
      "QUOTE_OUTDATED",
      "COUPON_INVALID",
      "COUPON_EXPIRED",
      "TRANSIENT_FAILURE",
    ]),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError
  ) {
    super(body.error.message);
    this.name = "ApiRequestError";
  }
}
