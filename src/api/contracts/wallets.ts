import { z } from "zod";
import { networkSchema } from "./common";

export const walletSlotSchema = z.enum(["primary", "secondary"]);
export type WalletSlot = z.infer<typeof walletSlotSchema>;

export const walletTypeSchema = z.enum(["metamask", "walletconnect", "coinbase"]);
export type WalletType = z.infer<typeof walletTypeSchema>;

export const walletSchema = z.object({
  id: z.string(),
  slot: walletSlotSchema,
  address: z.string(),
  network: networkSchema,
  label: z.string(),
  walletType: walletTypeSchema,
  referralCode: z.string(),
  secondaryReference: z.string().nullable(),
  connectedAt: z.iso.datetime(),
});
export type Wallet = z.infer<typeof walletSchema>;

export const upsertWalletRequestSchema = z.object({
  address: z
    .string()
    .trim()
    .min(20, "Endereço de carteira inválido")
    .max(64, "Endereço de carteira inválido"),
  network: networkSchema,
  label: z.string().min(1, "Dê um nome para a carteira"),
  walletType: walletTypeSchema,
  referralCode: z.string().min(1, "Informe um código de indicação"),
  secondaryReference: z.string().nullable().optional(),
});
export type UpsertWalletRequest = z.infer<typeof upsertWalletRequestSchema>;

export const walletsResponseSchema = z.object({
  primary: walletSchema.nullable(),
  secondary: walletSchema.nullable(),
});
export type WalletsResponse = z.infer<typeof walletsResponseSchema>;
