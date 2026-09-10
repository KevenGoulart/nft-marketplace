import { z } from "zod";
import { networkSchema } from "./common";
import { quoteLineItemInputSchema, quoteSchema } from "./quote";

export const collectorInfoSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.email("E-mail inválido"),
  document: z.string().min(5, "Documento inválido"),
});
export type CollectorInfo = z.infer<typeof collectorInfoSchema>;

export const createOrderRequestSchema = z.object({
  items: z.array(quoteLineItemInputSchema).min(1),
  couponCode: z.string().trim().optional(),
  quoteVersion: z.number().int(),
  walletId: z.string(),
  network: networkSchema,
  collector: collectorInfoSchema,
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const orderStatusSchema = z.enum(["pending", "confirmed", "refused"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  quoteSnapshot: quoteSchema,
  walletId: z.string(),
  network: networkSchema,
  collector: collectorInfoSchema,
  transactionRef: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  refusalReason: z.string().nullable(),
  version: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Order = z.infer<typeof orderSchema>;
